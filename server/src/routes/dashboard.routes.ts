import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateUser } from '../middleware/auth';
import { getUserDailyRank, getUserOverallRank } from '../services/leaderboard.service';
import { getUserProgress } from '../services/progress.service';
import { getTodayKolkata } from '../utils/timezone';

const router = Router();

/**
 * GET /api/v1/dashboard
 * Aggregates all key user metrics, coding rank, recent solves, latest resources,
 * research posts, and upcoming hackathons/events.
 */
router.get('/', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const today = getTodayKolkata();
    const now = new Date();

    const [
      progress,
      dailyRankResult,
      overallRankResult,
      recentSolves,
      latestResources,
      latestResearch,
      upcomingEvents,
    ] = await Promise.all([
      getUserProgress(userId),
      getUserDailyRank(userId, today),
      getUserOverallRank(userId),
      prisma.codingProblemSolve.findMany({
        where: { userId },
        orderBy: { solvedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          problemId: true,
          problemTitle: true,
          provider: true,
          solvedAt: true,
          solveDate: true,
        },
      }),
      prisma.academicResource.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              collegeName: true,
            },
          },
        },
      }),
      prisma.researchPost.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              collegeName: true,
            },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
      prisma.hackathonEvent.findMany({
        where: {
          eventStartDate: { gte: now },
        },
        orderBy: { eventStartDate: 'asc' },
        take: 5,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              collegeName: true,
            },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user!.id,
          name: req.user!.fullName,
          fullName: req.user!.fullName,
          email: req.user!.email,
          collegeName: req.user!.collegeName,
        },
        stats: {
          todaySolved: progress.todaySolved,
          totalSolved: progress.totalSolved,
          todayRank: dailyRankResult.rank,
          overallRank: overallRankResult.rank,
        },
        recentActivity: progress.dailyActivity.slice(-7),
        latestAcademics: latestResources,
        summary: {
          todaySolved: progress.todaySolved,
          totalSolved: progress.totalSolved,
          currentStreak: progress.currentStreak,
          dailyRank: dailyRankResult.rank,
          overallRank: overallRankResult.rank,
          averagePerActiveDay: progress.averagePerActiveDay,
        },
        progress: {
          dailyActivity: progress.dailyActivity.slice(-7), // Last 7 days for quick dashboard widget
          bestDay: progress.bestDay,
          lastSync: progress.lastSync,
          insights: progress.insights,
        },
        recentSolves,
        latestResources,
        latestResearch,
        upcomingEvents: upcomingEvents.map((e) => ({
          ...e,
          registrationUrl: e.registrationUrl,
          registerUrl: e.registrationUrl,
          eventStartDate: e.eventStartDate,
          startDate: e.eventStartDate,
          eventEndDate: e.eventEndDate,
          endDate: e.eventEndDate,
          creatorId: e.userId,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve dashboard data',
    });
  }
});

export default router;
