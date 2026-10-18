import { Router, Request, Response } from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  getDailyLeaderboard,
  getOverallLeaderboard,
  getUserDailyRank,
  getUserOverallRank,
} from '../services/leaderboard.service';
import { getTodayKolkata } from '../utils/timezone';

const router = Router();

/**
 * GET /api/v1/leaderboard/daily
 * Query parameters:
 *  - date: string (YYYY-MM-DD, defaults to today in Asia/Kolkata)
 *  - page: number (default 1)
 *  - limit: number (default 20, max 100)
 */
const handleDailyLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const date = (req.query.date as string) || getTodayKolkata();
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const userId = req.user?.id;

    const [leaderboard, myRank] = await Promise.all([
      getDailyLeaderboard(date, page, limit),
      userId ? getUserDailyRank(userId, date) : Promise.resolve(null),
    ]);

    res.status(200).json({
      success: true,
      data: {
        date,
        myRank: myRank?.rank ?? null,
        mySolvedCount: myRank?.solvedCount ?? 0,
        leaderboard: leaderboard.data,
        ...leaderboard,
      },
    });
  } catch (error) {
    console.error('Error fetching daily leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve daily leaderboard',
    });
  }
};

router.get('/daily', authenticateUser, handleDailyLeaderboard);
router.get('/today', authenticateUser, handleDailyLeaderboard);

/**
 * GET /api/v1/leaderboard/overall
 * Query parameters:
 *  - page: number (default 1)
 *  - limit: number (default 20, max 100)
 */
router.get('/overall', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const userId = req.user?.id;

    const [leaderboard, myRank] = await Promise.all([
      getOverallLeaderboard(page, limit),
      userId ? getUserOverallRank(userId) : Promise.resolve(null),
    ]);

    res.status(200).json({
      success: true,
      data: {
        myRank: myRank?.rank ?? null,
        mySolvedCount: myRank?.solvedCount ?? 0,
        leaderboard: leaderboard.data,
        ...leaderboard,
      },
    });
  } catch (error) {
    console.error('Error fetching overall leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve overall leaderboard',
    });
  }
});

export default router;
