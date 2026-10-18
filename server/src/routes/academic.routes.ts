import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { authenticateUser } from '../middleware/auth';
import { createResourceSchema, listResourcesQuerySchema } from '../validators/academic.validators';

const router = Router();

// Configure storage directory
const uploadDirectory = path.resolve(process.cwd(), process.env.UPLOADS_DIR || './uploads');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (_req, file, cb) => {
    const randomHex = crypto.randomBytes(8).toString('hex');
    const safeBaseName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .slice(0, 50);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomHex}-${safeBaseName}${ext}`);
  },
});

// Multer filter: PDF only, max 10MB
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents (.pdf) are allowed'));
    }
  },
});

/**
 * POST /api/v1/academics
 * Uploads an academic PDF resource, validates metadata, and saves record.
 */
router.post(
  '/',
  authenticateUser,
  (req: Request, res: Response, next) => {
    upload.single('file')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            success: false,
            error: 'File Too Large',
            message: 'Uploaded file exceeds the maximum allowed size of 10MB',
          });
          return;
        }
        res.status(400).json({
          success: false,
          error: 'Upload Error',
          message: err.message,
        });
        return;
      } else if (err) {
        res.status(400).json({
          success: false,
          error: 'Invalid File',
          message: err.message,
        });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    const file = req.file;

    try {
      if (!file) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'PDF file is required',
        });
        return;
      }

      // Validate body metadata
      const parseResult = createResourceSchema.safeParse(req.body);
      if (!parseResult.success) {
        // Clean up uploaded file if metadata validation fails
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: parseResult.error.errors[0]?.message || 'Invalid resource data',
          details: parseResult.error.errors,
        });
        return;
      }

      const { title, description, subject } = parseResult.data;
      const userId = req.user!.id;

      const resource = await prisma.academicResource.create({
        data: {
          userId,
          title,
          description,
          subject,
          fileName: file.originalname,
          storagePath: file.filename, // Store relative filename within upload directory
          fileSize: file.size,
          mimeType: file.mimetype || 'application/pdf',
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
        message: 'Resource uploaded successfully',
        data: {
          resource,
        },
      });
    } catch (error) {
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      console.error('Error creating academic resource:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to upload academic resource',
      });
    }
  }
);

/**
 * GET /api/v1/academics
 * List academic resources with search, subject filtering, and pagination.
 */
router.get('/', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const query = listResourcesQuerySchema.parse(req.query);
    const { search, subject, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (subject && subject !== 'All') {
      where.subject = subject;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [resources, total] = await Promise.all([
      prisma.academicResource.findMany({
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
        },
      }),
      prisma.academicResource.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        resources,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    console.error('Error listing academic resources:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve academic resources',
    });
  }
});

/**
 * GET /api/v1/academics/:id
 * Retrieve details of a single resource.
 */
router.get('/:id', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const resource = await prisma.academicResource.findUnique({
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

    if (!resource) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Academic resource not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        resource,
      },
    });
  } catch (error) {
    console.error('Error fetching academic resource:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve resource',
    });
  }
});

/**
 * GET /api/v1/academics/:id/download
 * Streams the PDF file download to the client.
 */
router.get('/:id/download', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const resource = await prisma.academicResource.findUnique({
      where: { id },
    });

    if (!resource) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Academic resource not found',
      });
      return;
    }

    const filePath = path.resolve(uploadDirectory, resource.storagePath);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Physical file not found on disk',
      });
      return;
    }

    res.setHeader('Content-Type', resource.mimeType || 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(resource.fileName)}"`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading academic resource:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to download resource',
    });
  }
});

/**
 * DELETE /api/v1/academics/:id
 * Delete own resource only (removes DB record and file from disk).
 */
router.delete('/:id', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const resource = await prisma.academicResource.findUnique({
      where: { id },
    });

    if (!resource) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Academic resource not found',
      });
      return;
    }

    if (resource.userId !== userId) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only delete your own uploaded resources',
      });
      return;
    }

    // Delete database record
    await prisma.academicResource.delete({
      where: { id },
    });

    // Delete file from disk if present
    const filePath = path.resolve(uploadDirectory, resource.storagePath);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Error deleting file ${filePath}:`, err);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting academic resource:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to delete resource',
    });
  }
});

export default router;
