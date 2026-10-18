import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateUser } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateProfileSchema, UpdateProfileInput } from '../validators/profile.validators';
import { extractLeetcodeUsername } from '../services/leetcode.service';

const router = Router();

/**
 * GET /api/v1/profile
 * Get current authenticated user's full profile including total solved count.
 */
router.get('/', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        collegeName: true,
        course: true,
        academicYear: true,
        linkedinUrl: true,
        leetcodeUrl: true,
        leetcodeUsername: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User profile not found',
      });
      return;
    }

    const solvedSolves = await prisma.codingProblemSolve.findMany({
      where: { userId },
      select: { problemId: true },
      distinct: ['problemId'],
    });

    res.status(200).json({
      success: true,
      data: {
        profile: {
          ...user,
          totalSolved: solvedSolves.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve profile',
    });
  }
});

/**
 * PUT /api/v1/profile
 * Update current authenticated user's profile information.
 */
router.put(
  '/',
  authenticateUser,
  validateBody(updateProfileSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const updates = req.body as UpdateProfileInput;

      const updateData: Record<string, any> = {};

      if (updates.fullName !== undefined) updateData.fullName = updates.fullName;
      if (updates.collegeName !== undefined) updateData.collegeName = updates.collegeName;
      if (updates.course !== undefined) updateData.course = updates.course;
      if (updates.academicYear !== undefined) updateData.academicYear = updates.academicYear;
      if (updates.linkedinUrl !== undefined) updateData.linkedinUrl = updates.linkedinUrl;

      if (updates.leetcodeUrl !== undefined) {
        updateData.leetcodeUrl = updates.leetcodeUrl;
        const extracted = extractLeetcodeUsername(updates.leetcodeUrl);
        if (extracted) {
          updateData.leetcodeUsername = extracted;
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          fullName: true,
          collegeName: true,
          course: true,
          academicYear: true,
          linkedinUrl: true,
          leetcodeUrl: true,
          leetcodeUsername: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          profile: updatedUser,
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update profile',
      });
    }
  }
);

/**
 * GET /api/v1/profile/:id
 * Get public profile of another user (omits email unless requesting own profile).
 */
router.get('/:id', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.id as string;
    const isSelf = req.user?.id === targetUserId;

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: isSelf,
        fullName: true,
        collegeName: true,
        course: true,
        academicYear: true,
        linkedinUrl: true,
        leetcodeUrl: true,
        leetcodeUsername: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User profile not found',
      });
      return;
    }

    const solvedSolves = await prisma.codingProblemSolve.findMany({
      where: { userId: targetUserId },
      select: { problemId: true },
      distinct: ['problemId'],
    });

    res.status(200).json({
      success: true,
      data: {
        profile: {
          ...user,
          totalSolved: solvedSolves.length,
          isSelf,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve public profile',
    });
  }
});

export default router;
