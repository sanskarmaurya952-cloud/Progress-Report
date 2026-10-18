import { z } from 'zod';
import { ACADEMIC_YEARS } from './auth.validators';

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .optional(),
  collegeName: z
    .string()
    .trim()
    .min(2, 'College name must be at least 2 characters')
    .optional(),
  course: z
    .string()
    .trim()
    .min(2, 'Course must be at least 2 characters')
    .optional(),
  academicYear: z.enum(ACADEMIC_YEARS).optional(),
  linkedinUrl: z
    .string()
    .trim()
    .url('Please provide a valid URL')
    .refine(
      (url) => /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/.+/i.test(url),
      'URL must be a valid LinkedIn profile URL (containing linkedin.com)'
    )
    .optional(),
  leetcodeUrl: z
    .string()
    .trim()
    .url('Please provide a valid URL')
    .refine(
      (url) => /(?:https?:\/\/)?(?:www\.)?leetcode\.com\/.+/i.test(url),
      'URL must be a valid LeetCode profile URL (containing leetcode.com)'
    )
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
