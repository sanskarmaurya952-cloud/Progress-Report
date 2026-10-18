import prisma from '../lib/prisma';
import { toKolkataDate } from '../utils/timezone';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

const REQUEST_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://leetcode.com',
};

export interface LeetCodeSubmission {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string | number;
}

export interface LeetCodeProfileStats {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

export interface LeetCodeCalendarData {
  streak: number;
  totalActiveDays: number;
  submissionCalendar: Record<string, number>;
}

export interface SyncResult {
  success: boolean;
  totalSolved: number;
  newProblems: number;
  message: string;
  syncId?: string;
}

/**
 * Extracts username from various formats of LeetCode profile URLs or bare handles.
 * e.g., https://leetcode.com/u/sanskardev/ -> sanskardev
 * e.g., https://leetcode.com/sanskardev -> sanskardev
 */
export function extractLeetcodeUsername(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Strip trailing slashes and query strings/hashes
  const cleanUrl = trimmed.split('?')[0].split('#')[0].replace(/\/+$/, '');

  // If already just a username (no slashes, no dots except alphanumeric)
  if (!cleanUrl.includes('/') && !cleanUrl.includes('.')) {
    return cleanUrl;
  }

  // Regex to match leetcode.com/(u/)?username
  const match = cleanUrl.match(/(?:https?:\/\/)?(?:www\.)?leetcode\.com\/(?:u\/)?([a-zA-Z0-9_\-]+)/i);
  if (match && match[1]) {
    return match[1];
  }

  // Fallback: take last path segment
  const segments = cleanUrl.split('/').filter(Boolean);
  return segments[segments.length - 1] || '';
}

/**
 * Generic LeetCode GraphQL fetcher with proper headers and error handling.
 */
async function queryLeetCodeGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: 'POST',
    headers: REQUEST_HEADERS,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('LeetCode rate limit encountered. Please try again later.');
    }
    throw new Error(`LeetCode API request failed with status: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as { data?: T; errors?: Array<{ message: string }> };

  if (json.errors && json.errors.length > 0) {
    throw new Error(`LeetCode GraphQL error: ${json.errors[0].message}`);
  }

  if (!json.data) {
    throw new Error('Empty response received from LeetCode API');
  }

  return json.data;
}

/**
 * Fetches user profile submission statistics from LeetCode.
 */
export async function fetchUserProfile(username: string): Promise<LeetCodeProfileStats | null> {
  const query = `
    query userProblemsSolved($username: String!) {
      matchedUser(username: $username) {
        username
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  try {
    const data = await queryLeetCodeGraphQL<{
      matchedUser: {
        username: string;
        submitStatsGlobal: {
          acSubmissionNum: Array<{ difficulty: string; count: number }>;
        };
      } | null;
    }>(query, { username });

    if (!data.matchedUser) {
      return null;
    }

    const acList = data.matchedUser.submitStatsGlobal.acSubmissionNum || [];
    const all = acList.find((item) => item.difficulty === 'All')?.count || 0;
    const easy = acList.find((item) => item.difficulty === 'Easy')?.count || 0;
    const medium = acList.find((item) => item.difficulty === 'Medium')?.count || 0;
    const hard = acList.find((item) => item.difficulty === 'Hard')?.count || 0;

    return {
      username: data.matchedUser.username,
      totalSolved: all,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
    };
  } catch (error) {
    console.error(`Error fetching LeetCode profile for ${username}:`, error);
    throw error;
  }
}

/**
 * Fetches recent accepted submissions for a user from LeetCode.
 */
export async function fetchRecentSubmissions(
  username: string,
  limit: number = 50
): Promise<LeetCodeSubmission[]> {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const data = await queryLeetCodeGraphQL<{
      recentAcSubmissionList: Array<{
        id: string;
        title: string;
        titleSlug: string;
        timestamp: string;
      }>;
    }>(query, { username, limit });

    return data.recentAcSubmissionList || [];
  } catch (error) {
    console.error(`Error fetching recent submissions for ${username}:`, error);
    throw error;
  }
}

/**
 * Fetches user submission calendar and streak details.
 */
export async function fetchUserCalendar(
  username: string,
  year?: number
): Promise<LeetCodeCalendarData | null> {
  const query = `
    query userProfileCalendar($username: String!, $year: Int) {
      matchedUser(username: $username) {
        userCalendar(year: $year) {
          streak
          totalActiveDays
          submissionCalendar
        }
      }
    }
  `;

  try {
    const data = await queryLeetCodeGraphQL<{
      matchedUser: {
        userCalendar: {
          streak: number;
          totalActiveDays: number;
          submissionCalendar: string;
        };
      } | null;
    }>(query, { username, year });

    if (!data.matchedUser || !data.matchedUser.userCalendar) {
      return null;
    }

    let parsedCalendar: Record<string, number> = {};
    try {
      parsedCalendar = JSON.parse(data.matchedUser.userCalendar.submissionCalendar || '{}');
    } catch {
      parsedCalendar = {};
    }

    return {
      streak: data.matchedUser.userCalendar.streak || 0,
      totalActiveDays: data.matchedUser.userCalendar.totalActiveDays || 0,
      submissionCalendar: parsedCalendar,
    };
  } catch (error) {
    console.error(`Error fetching user calendar for ${username}:`, error);
    return null;
  }
}

/**
 * Orchestrates full LeetCode sync for a user:
 * 1. Resolves LeetCode username
 * 2. Fetches recent accepted submissions & profile stats
 * 3. Normalizes dates into Asia/Kolkata
 * 4. Upserts problem solves skipping duplicates
 * 5. Logs sync status to CodingProgressSync
 */
export async function syncUserProgress(userId: string): Promise<SyncResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      leetcodeUrl: true,
      leetcodeUsername: true,
    },
  });

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  let username = user.leetcodeUsername;
  if (!username && user.leetcodeUrl) {
    username = extractLeetcodeUsername(user.leetcodeUrl);
    if (username) {
      await prisma.user.update({
        where: { id: userId },
        data: { leetcodeUsername: username },
      });
    }
  }

  if (!username) {
    const sync = await prisma.codingProgressSync.create({
      data: {
        userId,
        provider: 'leetcode',
        status: 'failed',
        newProblems: 0,
        errorMessage: 'Invalid or missing LeetCode username',
      },
    });

    return {
      success: false,
      totalSolved: 0,
      newProblems: 0,
      message: 'Invalid or missing LeetCode username',
      syncId: sync.id,
    };
  }

  try {
    // Fetch profile stats & recent submissions in parallel
    const [stats, submissions] = await Promise.all([
      fetchUserProfile(username).catch((err) => {
        console.warn(`Profile stats fetch warning: ${err.message}`);
        return null;
      }),
      fetchRecentSubmissions(username, 50),
    ]);

    const totalSolved = stats?.totalSolved ?? 0;

    // Deduplicate submissions by titleSlug from recentAcSubmissionList
    const uniqueMap = new Map<string, LeetCodeSubmission>();
    for (const sub of submissions) {
      if (!uniqueMap.has(sub.titleSlug)) {
        uniqueMap.set(sub.titleSlug, sub);
      }
    }
    const uniqueSubmissions = Array.from(uniqueMap.values());

    let newCount = 0;

    if (uniqueSubmissions.length > 0) {
      const problemSlugs = uniqueSubmissions.map((s) => s.titleSlug);

      // Find existing solves for this user and provider
      const existingSolves = await prisma.codingProblemSolve.findMany({
        where: {
          userId,
          provider: 'leetcode',
          problemId: { in: problemSlugs },
        },
        select: { problemId: true },
      });

      const existingSet = new Set(existingSolves.map((s) => s.problemId));

      // Filter solves that do not exist yet
      const solvesToInsert = uniqueSubmissions.filter((sub) => !existingSet.has(sub.titleSlug));

      if (solvesToInsert.length > 0) {
        // Upsert or insert each new solve
        for (const sub of solvesToInsert) {
          const timestampNum = Number(sub.timestamp);
          const solvedAt = new Date(timestampNum * 1000);
          const solveDate = toKolkataDate(timestampNum);

          await prisma.codingProblemSolve.upsert({
            where: {
              userId_provider_problemId: {
                userId,
                provider: 'leetcode',
                problemId: sub.titleSlug,
              },
            },
            create: {
              userId,
              provider: 'leetcode',
              problemId: sub.titleSlug,
              problemTitle: sub.title,
              solvedAt,
              solveDate,
            },
            update: {
              // Problem already exists; ensure solveDate is accurate
              solveDate,
              solvedAt,
            },
          });
        }
        newCount = solvesToInsert.length;
      }
    }

    // Record successful sync
    const syncRecord = await prisma.codingProgressSync.create({
      data: {
        userId,
        provider: 'leetcode',
        status: 'success',
        totalSolved,
        newProblems: newCount,
        errorMessage: null,
      },
    });

    return {
      success: true,
      totalSolved,
      newProblems: newCount,
      message: `Sync successful. Added ${newCount} new problems.`,
      syncId: syncRecord.id,
    };
  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown error during LeetCode sync';
    console.error(`LeetCode sync failed for user ${userId} (${username}):`, error);

    const syncRecord = await prisma.codingProgressSync.create({
      data: {
        userId,
        provider: 'leetcode',
        status: 'failed',
        newProblems: 0,
        errorMessage: errorMsg,
      },
    });

    return {
      success: false,
      totalSolved: 0,
      newProblems: 0,
      message: errorMsg,
      syncId: syncRecord.id,
    };
  }
}
