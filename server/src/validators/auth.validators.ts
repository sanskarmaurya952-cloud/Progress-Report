import { z } from 'zod';

export const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  'Other',
] as const;

export const registerSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, 'Full name must be at least 2 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please provide a valid email address')
      .toLowerCase(),
    collegeName: z
      .string({ required_error: 'College name is required' })
      .trim()
      .min(2, 'College name must be at least 2 characters'),
    course: z
      .string({ required_error: 'Course is required' })
      .trim()
      .min(2, 'Course must be at least 2 characters'),
    academicYear: z.enum(ACADEMIC_YEARS, {
      errorMap: () => ({ message: 'Please select a valid academic year' }),
    }),
    linkedinUrl: z
      .string({ required_error: 'LinkedIn profile URL is required' })
      .trim()
      .url('Please provide a valid URL')
      .refine(
        (url) => /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/.+/i.test(url),
        'URL must be a valid LinkedIn profile URL (containing linkedin.com)'
      ),
    leetcodeUrl: z
      .string({ required_error: 'LeetCode profile URL is required' })
      .trim()
      .url('Please provide a valid URL')
      .refine(
        (url) => /(?:https?:\/\/)?(?:www\.)?leetcode\.com\/.+/i.test(url),
        'URL must be a valid LeetCode profile URL (containing leetcode.com)'
      ),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string({ required_error: 'Confirm password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
