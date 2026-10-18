import { z } from 'zod';

export const EVENT_MODES = ['online', 'offline', 'hybrid'] as const;

export const EVENT_CATEGORIES = [
  'Hackathon',
  'Coding Contest',
  'Open Source / Fellowship',
  'Designathon',
  'Ideathon',
  'Tech Conference',
  'Workshop / Bootcamp',
  'Other',
] as const;

export const createEventSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title cannot exceed 200 characters'),
    description: z
      .string({ required_error: 'Description is required' })
      .trim()
      .min(10, 'Description must be at least 10 characters'),
    organizer: z
      .string({ required_error: 'Organizer is required' })
      .trim()
      .min(2, 'Organizer must be at least 2 characters'),
    registrationUrl: z.string().trim().url('Please provide a valid registration URL').optional(),
    registerUrl: z.string().trim().url('Please provide a valid registration URL').optional(),
    eventStartDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Event start date must be a valid date',
      })
      .optional(),
    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Event start date must be a valid date',
      })
      .optional(),
    eventEndDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Event end date must be a valid date',
      })
      .optional()
      .nullable(),
    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Event end date must be a valid date',
      })
      .optional()
      .nullable(),
    registrationDeadline: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Registration deadline must be a valid date',
      })
      .optional()
      .nullable(),
    mode: z.enum(EVENT_MODES, {
      errorMap: () => ({ message: 'Mode must be online, offline, or hybrid' }),
    }),
    location: z.string().trim().optional().nullable(),
    category: z.string({ required_error: 'Category is required' }).trim().min(2),
  })
  .refine(
    (data) => Boolean((data.registrationUrl && data.registrationUrl.length > 0) || (data.registerUrl && data.registerUrl.length > 0)),
    {
      message: 'Registration URL is required',
      path: ['registrationUrl'],
    }
  )
  .refine(
    (data) => Boolean(data.eventStartDate || data.startDate),
    {
      message: 'Event start date is required',
      path: ['eventStartDate'],
    }
  )
  .refine(
    (data) => {
      if ((data.mode === 'offline' || data.mode === 'hybrid') && (!data.location || data.location.trim().length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'Location is required when mode is offline or hybrid',
      path: ['location'],
    }
  );

export const updateEventSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().min(10).optional(),
    organizer: z.string().trim().min(2).optional(),
    registrationUrl: z.string().trim().url().optional(),
    registerUrl: z.string().trim().url().optional(),
    eventStartDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' })
      .optional(),
    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' })
      .optional(),
    eventEndDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' })
      .optional()
      .nullable(),
    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' })
      .optional()
      .nullable(),
    registrationDeadline: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid registration deadline' })
      .optional()
      .nullable(),
    mode: z.enum(EVENT_MODES).optional(),
    location: z.string().trim().optional().nullable(),
    category: z.string().trim().min(2).optional(),
  })
  .refine(
    (data) => {
      if ((data.mode === 'offline' || data.mode === 'hybrid') && (!data.location || data.location.trim().length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'Location is required when mode is offline or hybrid',
      path: ['location'],
    }
  );

export const listEventsQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(['all', 'upcoming', 'past']).optional().default('all'),
  mode: z.enum(EVENT_MODES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQueryInput = z.infer<typeof listEventsQuerySchema>;
