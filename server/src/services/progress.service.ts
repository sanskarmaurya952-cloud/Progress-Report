import prisma from '../lib/prisma';
import { getTodayKolkata, getYesterdayKolkata, getLastNDaysKolkata, toKolkataDate } from '../utils/timezone';

export interface DailyActivityItem {
  date: string;
  count: number;
}

export interface BestDay {
  date: string;
  count: number;
}

export interface LastSyncInfo {
  id: string;
  provider: string;
  status: string;
  totalSolved: number | null;
  newProblems: number;
  errorMessage: string | null;
  syncedAt: Date;
}

export interface UserProgressData {
  totalSolved: number;
  todaySolved: number;
  yesterdaySolved: number;
  currentStreak: number;
  dailyActivity: DailyActivityItem[];
  averagePerActiveDay: number;
  bestDay: BestDay | null;
  lastSync: LastSyncInfo | null;
  insights: string[];
}

/**
 * Calculates user's active streak in consecutive days ending today or yesterday.
 */
async function calculateCurrentStreak(userId: string): Promise<number> {
  const today = getTodayKolkata();
  const yesterday = getYesterdayKolkata();

  // Fetch unique solve dates for user in descending order
  const distinctDates = await prisma.codingProblemSolve.findMany({
    where: { userId },
    select: { solveDate: true },
    distinct: ['solveDate'],
    orderBy: { solveDate: 'desc' },
  });

  if (distinctDates.length === 0) {
    return 0;
  }

  const dateSet = new Set(distinctDates.map((d) => d.solveDate));

  let streak = 0;
  let checkDate: Date;

  if (dateSet.has(today)) {
    // Streak includes today
    streak = 1;
    checkDate = new Date();
  } else if (dateSet.has(yesterday)) {
    // Streak is alive ending yesterday
    streak = 1;
    checkDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  } else {
    // Neither today nor yesterday had any activity
    return 0;
  }

  // Count backwards from yesterday (or day before yesterday)
  while (true) {
    checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    const dateStr = toKolkataDate(checkDate);
    if (dateSet.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Generates personalized algorithmic progress insights based on metrics.
 */
function generateInsights(
  streak: number,
  todaySolved: number,
  yesterdaySolved: number,
  totalSolved: number,
  last30DaysTotal: number,
  averagePerActiveDay: number
): string[] {
  const insights: string[] = [];

  // Streak insights
  if (streak >= 30) {
    insights.push(`Legendary dedication! You are on an impressive ${streak}-day solving streak.`);
  } else if (streak >= 7) {
    insights.push(`Consistency pays off! You are on a ${streak}-day solving streak.`);
  } else if (streak >= 3) {
    insights.push(`Great momentum! Keep your ${streak}-day streak alive.`);
  } else if (streak === 1) {
    insights.push('Streak started! Solve another problem tomorrow to build your momentum.');
  } else {
    insights.push('Start a new streak today by tackling your daily challenge problem.');
  }

  // Daily activity insights
  if (todaySolved > 0) {
    insights.push(`High productivity today: You have solved ${todaySolved} problem${todaySolved > 1 ? 's' : ''}!`);
  } else if (yesterdaySolved > 0) {
    insights.push(`You solved ${yesterdaySolved} problem${yesterdaySolved > 1 ? 's' : ''} yesterday. Keep the fire burning today!`);
  }

  // Monthly velocity insights
  if (last30DaysTotal >= 50) {
    insights.push(`Unstoppable pace: ${last30DaysTotal} problems completed over the past 30 days.`);
  } else if (last30DaysTotal > 0) {
    insights.push(`You completed ${last30DaysTotal} problems in the last 30 days with an average of ${averagePerActiveDay} per active session.`);
  }

  // Milestone insights
  if (totalSolved >= 500) {
    insights.push('Master tier: Over 500 total problems solved on your profile.');
  } else if (totalSolved >= 100) {
    insights.push('Century club: Over 100 algorithms solved.');
  } else if (totalSolved === 0) {
    insights.push('Sync your LeetCode profile to automatically import your verified problem solves.');
  }

  return insights;
}

/**
 * Compiles comprehensive progress data for a user.
 */
export async function getUserProgress(userId: string): Promise<UserProgressData> {
  const today = getTodayKolkata();
  const yesterday = getYesterdayKolkata();
  const last30Days = getLastNDaysKolkata(30);

  // Run independent database queries concurrently
  const [
    totalSolvedCount,
    todaySolves,
    yesterdaySolves,
    last30DaysSolves,
    bestDayResult,
    lastSyncRecord,
    currentStreak,
  ] = await Promise.all([
    // All-time distinct solved problems count
    prisma.codingProblemSolve.findMany({
      where: { userId },
      select: { problemId: true },
      distinct: ['problemId'],
    }).then((solves) => solves.length),

    // Today's solved count
    prisma.codingProblemSolve.count({
      where: { userId, solveDate: today },
    }),

    // Yesterday's solved count
    prisma.codingProblemSolve.count({
      where: { userId, solveDate: yesterday },
    }),

    // Solves in the last 30 days grouped by solveDate
    prisma.codingProblemSolve.groupBy({
      by: ['solveDate'],
      where: {
        userId,
        solveDate: { in: last30Days },
      },
      _count: {
        problemId: true,
      },
    }),

    // All-time best day
    prisma.codingProblemSolve.groupBy({
      by: ['solveDate'],
      where: { userId },
      _count: {
        problemId: true,
      },
      orderBy: {
        _count: {
          problemId: 'desc',
        },
      },
      take: 1,
    }),

    // Last sync record
    prisma.codingProgressSync.findFirst({
      where: { userId },
      orderBy: { syncedAt: 'desc' },
    }),

    // Streak calculation
    calculateCurrentStreak(userId),
  ]);

  // Build 30-day activity map
  const activityMap = new Map<string, number>();
  for (const item of last30DaysSolves) {
    activityMap.set(item.solveDate, item._count.problemId);
  }

  const dailyActivity: DailyActivityItem[] = last30Days.map((date) => ({
    date,
    count: activityMap.get(date) || 0,
  }));

  const activeDays = dailyActivity.filter((d) => d.count > 0);
  const totalLast30DaysSolves = activeDays.reduce((acc, curr) => acc + curr.count, 0);
  const averagePerActiveDay =
    activeDays.length > 0
      ? Number((totalLast30DaysSolves / activeDays.length).toFixed(2))
      : 0;

  const bestDay: BestDay | null =
    bestDayResult.length > 0
      ? {
          date: bestDayResult[0].solveDate,
          count: bestDayResult[0]._count.problemId,
        }
      : null;

  const lastSync: LastSyncInfo | null = lastSyncRecord
    ? {
        id: lastSyncRecord.id,
        provider: lastSyncRecord.provider,
        status: lastSyncRecord.status,
        totalSolved: lastSyncRecord.totalSolved,
        newProblems: lastSyncRecord.newProblems,
        errorMessage: lastSyncRecord.errorMessage,
        syncedAt: lastSyncRecord.syncedAt,
      }
    : null;

  const insights = generateInsights(
    currentStreak,
    todaySolves,
    yesterdaySolves,
    totalSolvedCount,
    totalLast30DaysSolves,
    averagePerActiveDay
  );

  return {
    totalSolved: totalSolvedCount,
    todaySolved: todaySolves,
    yesterdaySolved: yesterdaySolves,
    currentStreak,
    dailyActivity,
    averagePerActiveDay,
    bestDay,
    lastSync,
    insights,
  };
}
