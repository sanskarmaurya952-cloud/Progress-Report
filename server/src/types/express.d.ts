import { Session } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  collegeName: string;
  course: string;
  academicYear: string;
  linkedinUrl: string;
  leetcodeUrl: string;
  leetcodeUsername: string | null;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      session?: Session;
    }
  }
}
