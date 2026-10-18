import argon2 from 'argon2';
import crypto from 'crypto';
import { Session, User } from '@prisma/client';
import prisma from './prisma';

/**
 * Hashes a plaintext password using Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Verifies a plaintext password against an Argon2 hash.
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically secure random token string.
 */
export function generateToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Creates a new session for a user with a 7-day expiration.
 */
export async function createSession(userId: string): Promise<Session> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
}

/**
 * Deletes a session by token.
 */
export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { token },
  });
}

/**
 * Retrieves a valid, non-expired session along with associated user details.
 */
export async function getSessionByToken(token: string): Promise<(Session & { user: User }) | null> {
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  // Check if session has expired
  if (session.expiresAt.getTime() <= Date.now()) {
    // Clean up expired session asynchronously
    prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session;
}
