import { Router, Request, Response } from 'express';
import { authenticateUser } from '../middleware/auth';
import { getUserProgress } from '../services/progress.service';
import { syncUserProgress } from '../services/leetcode.service';

const router = Router();

/**
 * GET /api/v1/progress
 * Get complete progress data for the currently authenticated user.
 */
router.get('/', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const progress = await getUserProgress(userId);

    res.status(200).json({
      success: true,
      data: {
        progress,
        stats: {
          todaySolved: progress.todaySolved,
          yesterdaySolved: progress.yesterdaySolved,
          totalSolved: progress.totalSolved,
          currentStreak: progress.currentStreak,
          bestDay: progress.bestDay,
          avgActiveDay: progress.averagePerActiveDay,
        },
        history: progress.dailyActivity,
        syncStatus: {
          lastSyncTime: progress.lastSync?.syncedAt ? progress.lastSync.syncedAt.toISOString() : null,
          status: progress.lastSync?.status || null,
        },
        insights: progress.insights,
      },
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve progress data',
    });
  }
});

/**
 * POST /api/v1/progress/sync
 * Triggers an on-demand synchronization with the user's LeetCode profile.
 */
router.post('/sync', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const syncResult = await syncUserProgress(userId);

    if (!syncResult.success) {
      res.status(400).json({
        success: false,
        error: 'Sync Failed',
        message: syncResult.message,
        data: syncResult,
      });
      return;
    }

    // After successful sync, return updated progress snapshot
    const updatedProgress = await getUserProgress(userId);

    res.status(200).json({
      success: true,
      message: syncResult.message,
      data: {
        sync: syncResult,
        progress: updatedProgress,
      },
    });
  } catch (error: any) {
    console.error('Error triggering progress sync:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error?.message || 'Failed to sync progress with LeetCode',
    });
  }
});

export default router;
