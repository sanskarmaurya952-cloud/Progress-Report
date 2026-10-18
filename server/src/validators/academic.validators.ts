import { z } from 'zod';

export const ACADEMIC_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Data Structures & Algorithms',
  'Database Management Systems',
  'Operating Systems',
  'Computer Networks',
  'Software Engineering',
  'Machine Learning & AI',
  'Web Development',
  'Computer Architecture',
  'Theory of Computation',
  'Cybersecurity',
  'Cloud Computing',
  'Other',
] as const;

export const createResourceSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  subject: z.enum(ACADEMIC_SUBJECTS, {
    errorMap: () => ({ message: 'Please select a valid subject from the allowed list' }),
  }),
});

export const listResourcesQuerySchema = z.object({
  search: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type ListResourcesQueryInput = z.infer<typeof listResourcesQuerySchema>;
