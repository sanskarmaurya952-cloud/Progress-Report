import prisma from '../lib/prisma';
import { getTodayKolkata } from '../utils/timezone';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  collegeName: string;
  leetcodeUrl: string;
  leetcodeUsername: string | null;
  solvedCount: number;
  earliestSolve?: Date | string | null;
}

export interface PaginatedLeaderboard {
  data: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserRankResult {
  rank: number | null;
  solvedCount: number;
}

/**
 * Returns daily leaderboard for a given date (defaults to today in Asia/Kolkata).
 * Orders by solvedCount DESC, then earliestSolve ASC for tie-breaking.
 */
export async function getDailyLeaderboard(
  date?: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedLeaderboard> {
  const targetDate = date || getTodayKolkata();
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(100, limit));
  const offset = (safePage - 1) * safeLimit;

  try {
    // Attempt high-performance SQL query with window ranking
    const rawEntries: any[] = await prisma.$queryRaw`
      SELECT 
        cps."userId",
        COUNT(DISTINCT cps."problemId")::int AS "solvedCount",
        MIN(cps."solvedAt") AS "earliestSolve",
        u."fullName",
        u."collegeName",
        u."leetcodeUrl",
        u."leetcodeUsername"
      FROM "CodingProblemSolve" cps
      JOIN "User" u ON cps."userId" = u."id"
      WHERE cps."solveDate" = ${targetDate}
      GROUP BY cps."userId", u."fullName", u."collegeName", u."leetcodeUrl", u."leetcodeUsername"
      ORDER BY "solvedCount" DESC, "earliestSolve" ASC
      LIMIT ${safeLimit} OFFSET ${offset}
    `;

    const countResult: any[] = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "userId")::int AS total
      FROM "CodingProblemSolve"
      WHERE "solveDate" = ${targetDate}
    `;

    const total = Number(countResult[0]?.total || 0);

    const data: LeaderboardEntry[] = rawEntries.map((row, idx) => ({
      rank: offset + idx + 1,
      userId: row.userId,
      fullName: row.fullName,
      collegeName: row.collegeName,
      leetcodeUrl: row.leetcodeUrl,
      leetcodeUsername: row.leetcodeUsername,
      solvedCount: Number(row.solvedCount || 0),
      earliestSolve: row.earliestSolve,
    }));

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    };
  } catch (sqlError) {
    // Graceful fallback using Prisma groupBy
    console.warn('Prisma raw query fallback to groupBy for daily leaderboard:', sqlError);

    const grouped = await prisma.codingProblemSolve.groupBy({
      by: ['userId'],
      where: { solveDate: targetDate },
      _count: { problemId: true },
      _min: { solvedAt: true },
      orderBy: [
        { _count: { problemId: 'desc' } },
        { _min: { solvedAt: 'asc' } },
      ],
    });

    const total = grouped.length;
    const pagedGroups = grouped.slice(offset, offset + safeLimit);
    const userIds = pagedGroups.map((g) => g.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullName: true,
        collegeName: true,
        leetcodeUrl: true,
        leetcodeUsername: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const data: LeaderboardEntry[] = pagedGroups.map((g, idx) => {
      const u = userMap.get(g.userId);
      return {
        rank: offset + idx + 1,
        userId: g.userId,
        fullName: u?.fullName || 'Anonymous',
        collegeName: u?.collegeName || '',
        leetcodeUrl: u?.leetcodeUrl || '',
        leetcodeUsername: u?.leetcodeUsername || null,
        solvedCount: g._count.problemId,
        earliestSolve: g._min.solvedAt,
      };
    });

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    };
  }
}

/**
 * Returns all-time overall leaderboard.
 * Orders by solvedCount DESC, then User.createdAt ASC.
 */
export async function getOverallLeaderboard(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedLeaderboard> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(100, limit));
  const offset = (safePage - 1) * safeLimit;

  try {
    const rawEntries: any[] = await prisma.$queryRaw`
      SELECT 
        cps."userId",
        COUNT(DISTINCT cps."problemId")::int AS "solvedCount",
        u."createdAt" AS "userCreatedAt",
        u."fullName",
        u."collegeName",
        u."leetcodeUrl",
        u."leetcodeUsername"
      FROM "CodingProblemSolve" cps
      JOIN "User" u ON cps."userId" = u."id"
      GROUP BY cps."userId", u."createdAt", u."fullName", u."collegeName", u."leetcodeUrl", u."leetcodeUsername"
      ORDER BY "solvedCount" DESC, "userCreatedAt" ASC
      LIMIT ${safeLimit} OFFSET ${offset}
    `;

    const countResult: any[] = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "userId")::int AS total
      FROM "CodingProblemSolve"
    `;

    const total = Number(countResult[0]?.total || 0);

    const data: LeaderboardEntry[] = rawEntries.map((row, idx) => ({
      rank: offset + idx + 1,
      userId: row.userId,
      fullName: row.fullName,
      collegeName: row.collegeName,
      leetcodeUrl: row.leetcodeUrl,
      leetcodeUsername: row.leetcodeUsername,
      solvedCount: Number(row.solvedCount || 0),
    }));

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    };
  } catch (sqlError) {
    console.warn('Prisma raw query fallback to groupBy for overall leaderboard:', sqlError);

    const grouped = await prisma.codingProblemSolve.groupBy({
      by: ['userId'],
      _count: { problemId: true },
      orderBy: [{ _count: { problemId: 'desc' } }],
    });

    const total = grouped.length;
    const pagedGroups = grouped.slice(offset, offset + safeLimit);
    const userIds = pagedGroups.map((g) => g.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullName: true,
        collegeName: true,
        leetcodeUrl: true,
        leetcodeUsername: true,
        createdAt: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const data: LeaderboardEntry[] = pagedGroups.map((g, idx) => {
      const u = userMap.get(g.userId);
      return {
        rank: offset + idx + 1,
        userId: g.userId,
        fullName: u?.fullName || 'Anonymous',
        collegeName: u?.collegeName || '',
        leetcodeUrl: u?.leetcodeUrl || '',
        leetcodeUsername: u?.leetcodeUsername || null,
        solvedCount: g._count.problemId,
      };
    });

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    };
  }
}

/**
 * Returns a user's daily rank and solved count for a given date.
 */
export async function getUserDailyRank(userId: string, date?: string): Promise<UserRankResult> {
  const targetDate = date || getTodayKolkata();

  try {
    const result: any[] = await prisma.$queryRaw`
      WITH ranked AS (
        SELECT 
          cps."userId",
          COUNT(DISTINCT cps."problemId")::int AS "solvedCount",
          MIN(cps."solvedAt") AS "earliestSolve",
          ROW_NUMBER() OVER (
            ORDER BY COUNT(DISTINCT cps."problemId") DESC, MIN(cps."solvedAt") ASC
          ) AS rank
        FROM "CodingProblemSolve" cps
        WHERE cps."solveDate" = ${targetDate}
        GROUP BY cps."userId"
      )
      SELECT rank::int, "solvedCount"::int FROM ranked WHERE "userId" = ${userId}
    `;

    if (result.length > 0) {
      return {
        rank: Number(result[0].rank),
        solvedCount: Number(result[0].solvedCount),
      };
    }
  } catch (err) {
    // Fallback to groupBy
    const grouped = await prisma.codingProblemSolve.groupBy({
      by: ['userId'],
      where: { solveDate: targetDate },
      _count: { problemId: true },
      _min: { solvedAt: true },
      orderBy: [
        { _count: { problemId: 'desc' } },
        { _min: { solvedAt: 'asc' } },
      ],
    });

    const index = grouped.findIndex((g) => g.userId === userId);
    if (index !== -1) {
      return {
        rank: index + 1,
        solvedCount: grouped[index]._count.problemId,
      };
    }
  }

  // Check if user exists but has 0 solves for this date
  return {
    rank: null,
    solvedCount: 0,
  };
}

/**
 * Returns a user's overall rank and total solved count across all time.
 */
export async function getUserOverallRank(userId: string): Promise<UserRankResult> {
  try {
    const result: any[] = await prisma.$queryRaw`
      WITH ranked AS (
        SELECT 
          cps."userId",
          COUNT(DISTINCT cps."problemId")::int AS "solvedCount",
          ROW_NUMBER() OVER (
            ORDER BY COUNT(DISTINCT cps."problemId") DESC, u."createdAt" ASC
          ) AS rank
        FROM "CodingProblemSolve" cps
        JOIN "User" u ON cps."userId" = u."id"
        GROUP BY cps."userId", u."createdAt"
      )
      SELECT rank::int, "solvedCount"::int FROM ranked WHERE "userId" = ${userId}
    `;

    if (result.length > 0) {
      return {
        rank: Number(result[0].rank),
        solvedCount: Number(result[0].solvedCount),
      };
    }
  } catch (err) {
    // Fallback to groupBy
    const grouped = await prisma.codingProblemSolve.groupBy({
      by: ['userId'],
      _count: { problemId: true },
      orderBy: [{ _count: { problemId: 'desc' } }],
    });

    const index = grouped.findIndex((g) => g.userId === userId);
    if (index !== -1) {
      return {
        rank: index + 1,
        solvedCount: grouped[index]._count.problemId,
      };
    }
  }

  return {
    rank: null,
    solvedCount: 0,
  };
}
