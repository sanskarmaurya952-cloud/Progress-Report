import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import dashboardRoutes from './dashboard.routes';
import leaderboardRoutes from './leaderboard.routes';
import progressRoutes from './progress.routes';
import academicRoutes from './academic.routes';
import researchRoutes from './research.routes';
import eventRoutes from './event.routes';

const router = Router();

// Liveness / health check
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/progress', progressRoutes);
router.use('/academics', academicRoutes);
router.use('/research', researchRoutes);
router.use('/events', eventRoutes);

export default router;
