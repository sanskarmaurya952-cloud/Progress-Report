import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateUser } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createEventSchema,
  updateEventSchema,
  listEventsQuerySchema,
  CreateEventInput,
  UpdateEventInput,
} from '../validators/event.validators';

const router = Router();

function formatEvent(event: any) {
  if (!event) return event;
  return {
    ...event,
    registrationUrl: event.registrationUrl,
    registerUrl: event.registrationUrl,
    eventStartDate: event.eventStartDate,
    startDate: event.eventStartDate,
    eventEndDate: event.eventEndDate,
    endDate: event.eventEndDate,
    creatorId: event.userId,
  };
}

/**
 * POST /api/v1/events
 * Create a new hackathon or tech event.
 */
router.post(
  '/',
  authenticateUser,
  validateBody(createEventSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const body = req.body as any;
      const title = body.title;
      const description = body.description;
      const organizer = body.organizer;
      const registrationUrl = (body.registrationUrl || body.registerUrl || '').trim();
      const sDate = body.eventStartDate || body.startDate;
      const eDate = body.eventEndDate !== undefined ? body.eventEndDate : body.endDate;
      const rDeadline = body.registrationDeadline;
      const mode = body.mode;
      const location = body.location;
      const category = body.category;

      const event = await prisma.hackathonEvent.create({
        data: {
          userId,
          title: title.trim(),
          description: description.trim(),
          organizer: organizer.trim(),
          registrationUrl,
          eventStartDate: new Date(sDate),
          eventEndDate: eDate ? new Date(eDate) : null,
          registrationDeadline: rDeadline ? new Date(rDeadline) : null,
          mode,
          location: location?.trim() || null,
          category: category.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              collegeName: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: {
          event: formatEvent(event),
        },
      });
    } catch (error) {
      console.error('Error creating hackathon event:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create event',
      });
    }
  }
);

/**
 * GET /api/v1/events
 * List events with filtering by search, category, mode, status (upcoming/past), and pagination.
 */
router.get(
  '/',
  authenticateUser,
  validateQuery(listEventsQuerySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        search,
        category,
        status = 'all',
        mode,
        page = 1,
        limit = 10,
      } = req.query as any;

      const skip = (page - 1) * limit;
      const now = new Date();

      const where: any = {};

      if (category && category !== 'All') {
        where.category = category;
      }

      if (mode) {
        where.mode = mode;
      }

      if (status === 'upcoming') {
        where.eventStartDate = { gte: now };
      } else if (status === 'past') {
        where.eventStartDate = { lt: now };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { organizer: { contains: search, mode: 'insensitive' } },
        ];
      }

      const orderBy =
        status === 'upcoming'
          ? { eventStartDate: 'asc' as const }
          : { eventStartDate: 'desc' as const };

      const [events, total] = await Promise.all([
        prisma.hackathonEvent.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                collegeName: true,
              },
            },
          },
        }),
        prisma.hackathonEvent.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          events: events.map(formatEvent),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
      });
    } catch (error) {
      console.error('Error listing events:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve events',
      });
    }
  }
);

/**
 * GET /api/v1/events/:id
 * Retrieve details of a single event.
 */
router.get('/:id', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const event = await prisma.hackathonEvent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            collegeName: true,
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Event not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        event: formatEvent(event),
      },
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve event',
    });
  }
});

/**
 * PUT /api/v1/events/:id
 * Update an existing event (creator only).
 */
router.put(
  '/:id',
  authenticateUser,
  validateBody(updateEventSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const updates = req.body as any;

      const existingEvent = await prisma.hackathonEvent.findUnique({
        where: { id },
      });

      if (!existingEvent) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Event not found',
        });
        return;
      }

      if (existingEvent.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only edit your own events',
        });
        return;
      }

      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title.trim();
      if (updates.description !== undefined) updateData.description = updates.description.trim();
      if (updates.organizer !== undefined) updateData.organizer = updates.organizer.trim();
      if (updates.registrationUrl !== undefined || updates.registerUrl !== undefined) {
        updateData.registrationUrl = (updates.registrationUrl || updates.registerUrl || '').trim();
      }
      const sDate = updates.eventStartDate || updates.startDate;
      if (sDate !== undefined) updateData.eventStartDate = new Date(sDate);
      const eDate = updates.eventEndDate !== undefined ? updates.eventEndDate : updates.endDate;
      if (eDate !== undefined) updateData.eventEndDate = eDate ? new Date(eDate) : null;
      if (updates.registrationDeadline !== undefined)
        updateData.registrationDeadline = updates.registrationDeadline
          ? new Date(updates.registrationDeadline)
          : null;
      if (updates.mode !== undefined) updateData.mode = updates.mode;
      if (updates.location !== undefined) updateData.location = updates.location?.trim() || null;
      if (updates.category !== undefined) updateData.category = updates.category.trim();

      const updatedEvent = await prisma.hackathonEvent.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              collegeName: true,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: {
          event: formatEvent(updatedEvent),
        },
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update event',
      });
    }
  }
);

/**
 * DELETE /api/v1/events/:id
 * Delete an event (creator only).
 */
router.delete('/:id', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const existingEvent = await prisma.hackathonEvent.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Event not found',
      });
      return;
    }

    if (existingEvent.userId !== userId) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only delete your own events',
      });
      return;
    }

    await prisma.hackathonEvent.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to delete event',
    });
  }
});

export default router;
