import { z } from 'zod';

export const RESEARCH_CATEGORIES = [
  'Artificial Intelligence & Machine Learning',
  'Systems & Architecture',
  'Cybersecurity & Cryptography',
  'Data Science & Analytics',
  'Human-Computer Interaction',
  'Algorithms & Theory',
  'Robotics & Embedded Systems',
  'Cloud & Distributed Systems',
  'General Computer Science',
] as const;

export const createPostSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(250, 'Title cannot exceed 250 characters'),
  abstract: z
    .string({ required_error: 'Abstract is required' })
    .trim()
    .min(20, 'Abstract must be at least 20 characters')
    .max(3000, 'Abstract cannot exceed 3000 characters'),
  content: z
    .string({ required_error: 'Content is required' })
    .trim()
    .min(50, 'Content must be at least 50 characters'),
  category: z.string({ required_error: 'Category is required' }).trim().min(2),
  referenceLinks: z
    .array(z.string().trim().url('Each reference link must be a valid URL'))
    .optional()
    .default([]),
});

export const updatePostSchema = createPostSchema.partial();

export const createCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required' })
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters'),
});

export const updateCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required' })
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters'),
});

export const listResearchQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
