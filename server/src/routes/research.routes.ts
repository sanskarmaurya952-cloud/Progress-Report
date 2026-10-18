import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateUser } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  updateCommentSchema,
  listResearchQuerySchema,
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
} from '../validators/research.validators';
import { sanitizeHtml } from '../utils/sanitize';

const router = Router();

/**
 * POST /api/v1/research
 * Create a new research post.
 */
router.post(
  '/',
  authenticateUser,
  validateBody(createPostSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, abstract, content, category, referenceLinks } = req.body as CreatePostInput;
      const userId = req.user!.id;

      const post = await prisma.researchPost.create({
        data: {
          userId,
          title: title.trim(),
          abstract: sanitizeHtml(abstract),
          content: sanitizeHtml(content),
          category: category.trim(),
          referenceLinks: referenceLinks || [],
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              collegeName: true,
              linkedinUrl: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Research post created successfully',
        data: {
          post,
        },
      });
    } catch (error) {
      console.error('Error creating research post:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create research post',
      });
    }
  }
);

/**
 * GET /api/v1/research
 * List research posts with search, category filtering, and pagination.
 */
router.get(
  '/',
  authenticateUser,
  validateQuery(listResearchQuerySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, category, page = 1, limit = 10 } = req.query as any;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (category && category !== 'All') {
        where.category = category;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { abstract: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [posts, total] = await Promise.all([
        prisma.researchPost.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                collegeName: true,
              },
            },
            _count: {
              select: { comments: true },
            },
          },
        }),
        prisma.researchPost.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          posts,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
      });
    } catch (error) {
      console.error('Error listing research posts:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve research posts',
      });
    }
  }
);

/**
 * GET /api/v1/research/:id
 * Retrieve a single research post along with all its comments.
 */
router.get('/:id', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const post = await prisma.researchPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            collegeName: true,
            linkedinUrl: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                collegeName: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Research post not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        post,
      },
    });
  } catch (error) {
    console.error('Error retrieving research post:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve research post',
    });
  }
});

/**
 * PUT /api/v1/research/:id
 * Update an existing research post (owner only).
 */
router.put(
  '/:id',
  authenticateUser,
  validateBody(updatePostSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const updates = req.body as UpdatePostInput;

      const existingPost = await prisma.researchPost.findUnique({
        where: { id },
      });

      if (!existingPost) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Research post not found',
        });
        return;
      }

      if (existingPost.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only update your own research posts',
        });
        return;
      }

      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title.trim();
      if (updates.abstract !== undefined) updateData.abstract = sanitizeHtml(updates.abstract);
      if (updates.content !== undefined) updateData.content = sanitizeHtml(updates.content);
      if (updates.category !== undefined) updateData.category = updates.category.trim();
      if (updates.referenceLinks !== undefined) updateData.referenceLinks = updates.referenceLinks;

      const updatedPost = await prisma.researchPost.update({
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
        message: 'Research post updated successfully',
        data: {
          post: updatedPost,
        },
      });
    } catch (error) {
      console.error('Error updating research post:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update research post',
      });
    }
  }
);

/**
 * DELETE /api/v1/research/:id
 * Delete an existing research post (owner only).
 */
router.delete('/:id', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const existingPost = await prisma.researchPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Research post not found',
      });
      return;
    }

    if (existingPost.userId !== userId) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only delete your own research posts',
      });
      return;
    }

    await prisma.researchPost.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Research post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting research post:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to delete research post',
    });
  }
});

/**
 * POST /api/v1/research/:id/comments
 * Add a comment to a research post.
 */
router.post(
  '/:id/comments',
  authenticateUser,
  validateBody(createCommentSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = req.params.id as string;
      const userId = req.user!.id;
      const { content } = req.body as CreateCommentInput;

      const post = await prisma.researchPost.findUnique({
        where: { id: postId },
      });

      if (!post) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Research post not found',
        });
        return;
      }

      const comment = await prisma.researchComment.create({
        data: {
          postId,
          userId,
          content: sanitizeHtml(content),
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
        message: 'Comment added successfully',
        data: {
          comment,
        },
      });
    } catch (error) {
      console.error('Error adding research comment:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to add comment',
      });
    }
  }
);

/**
 * PUT /api/v1/research/:id/comments/:commentId
 * Update an existing comment (author only).
 */
router.put(
  '/:id/comments/:commentId',
  authenticateUser,
  validateBody(updateCommentSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = req.params.id as string;
      const commentId = req.params.commentId as string;
      const userId = req.user!.id;
      const { content } = req.body;

      const existingComment = await prisma.researchComment.findUnique({
        where: { id: commentId },
      });

      if (!existingComment || existingComment.postId !== postId) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Comment not found',
        });
        return;
      }

      if (existingComment.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only edit your own comments',
        });
        return;
      }

      const updatedComment = await prisma.researchComment.update({
        where: { id: commentId },
        data: {
          content: sanitizeHtml(content),
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

      res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: {
          comment: updatedComment,
        },
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update comment',
      });
    }
  }
);

/**
 * DELETE /api/v1/research/:id/comments/:commentId
 * Delete a comment (author only).
 */
router.delete(
  '/:id/comments/:commentId',
  authenticateUser,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = req.params.id as string;
      const commentId = req.params.commentId as string;
      const userId = req.user!.id;

      const existingComment = await prisma.researchComment.findUnique({
        where: { id: commentId },
      });

      if (!existingComment || existingComment.postId !== postId) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Comment not found',
        });
        return;
      }

      if (existingComment.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only delete your own comments',
        });
        return;
      }

      await prisma.researchComment.delete({
        where: { id: commentId },
      });

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete comment',
      });
    }
  }
);

export default router;
