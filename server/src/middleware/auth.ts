import { Request, Response, NextFunction } from 'express';
import { getSessionByToken } from '../lib/auth';
import { AuthenticatedUser } from '../types/express';

export const SESSION_COOKIE_NAME = 'uplivo_session';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
};

/**
 * Middleware to authenticate requests via session cookie.
 */
export async function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.[SESSION_COOKIE_NAME];

    // Fallback to Bearer token in Authorization header if present
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7).trim();
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    const sessionData = await getSessionByToken(token);

    if (!sessionData || !sessionData.user) {
      // Clear invalid cookie
      res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Session has expired or is invalid. Please log in again.',
      });
      return;
    }

    const { passwordHash, ...safeUser } = sessionData.user;

    req.user = safeUser as AuthenticatedUser;
    req.session = sessionData;

    next();
  } catch (error) {
    next(error);
  }
}
