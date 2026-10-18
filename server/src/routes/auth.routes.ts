import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { hashPassword, verifyPassword, createSession, deleteSession } from '../lib/auth';
import { authenticateUser, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { registerSchema, loginSchema, RegisterInput, LoginInput } from '../validators/auth.validators';
import { extractLeetcodeUsername, syncUserProgress } from '../services/leetcode.service';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user, extract LeetCode username, create session, set cookie.
 */
router.post(
  '/register',
  validateBody(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        email,
        password,
        fullName,
        collegeName,
        course,
        academicYear,
        linkedinUrl,
        leetcodeUrl,
      } = req.body as RegisterInput;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'An account with this email address already exists',
        });
        return;
      }

      // Hash password with Argon2id
      const passwordHash = await hashPassword(password);

      // Extract LeetCode username from URL
      const leetcodeUsername = extractLeetcodeUsername(leetcodeUrl);

      // Create user and initial session within a transaction
      const { user, session } = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash,
            fullName,
            collegeName,
            course,
            academicYear,
            linkedinUrl,
            leetcodeUrl,
            leetcodeUsername: leetcodeUsername || null,
          },
        });

        // Generate session with 7-day expiry
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const { generateToken } = await import('../lib/auth');
        const token = generateToken();

        const newSession = await tx.session.create({
          data: {
            userId: newUser.id,
            token,
            expiresAt,
          },
        });

        return { user: newUser, session: newSession };
      });

      // Set HTTP-only session cookie
      res.cookie(SESSION_COOKIE_NAME, session.token, SESSION_COOKIE_OPTIONS);

      // Asynchronously trigger initial LeetCode sync if username exists
      if (user.id && user.leetcodeUsername) {
        syncUserProgress(user.id).catch((syncErr) => {
          console.warn(`Initial LeetCode sync background error for ${user.id}:`, syncErr);
        });
      }

      const { passwordHash: _, ...safeUser } = user;

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          user: safeUser,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Registration failed due to a server error',
      });
    }
  }
);

/**
 * POST /api/v1/auth/login
 * Authenticate with email & password, create session, set cookie.
 */
router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body as LoginInput;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
        return;
      }

      const isValidPassword = await verifyPassword(user.passwordHash, password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
        return;
      }

      // Create new session
      const session = await createSession(user.id);

      // Set HTTP-only session cookie
      res.cookie(SESSION_COOKIE_NAME, session.token, SESSION_COOKIE_OPTIONS);

      const { passwordHash: _, ...safeUser } = user;

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: {
          user: safeUser,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Login failed due to a server error',
      });
    }
  }
);

/**
 * POST /api/v1/auth/logout
 * Invalidate session and clear session cookie.
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    if (token) {
      await deleteSession(token);
    }

    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Logout failed due to a server error',
    });
  }
});

/**
 * GET /api/v1/auth/me
 * Return currently authenticated user profile.
 */
router.get('/me', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

export default router;
