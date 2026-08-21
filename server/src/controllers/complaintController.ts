import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Create a new complaint
export const createComplaint = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { packageId, subject, message } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Le sujet et le message sont obligatoires' });
    }

    const complaint = await prisma.complaint.create({
      data: {
        userId: req.user.userId,
        packageId: packageId || null,
        subject,
        message,
        status: 'PENDING'
      }
    });

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// Get all complaints (Admin only)
export const getComplaints = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true
          }
        },
        package: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, complaints });
  } catch (error) {
    next(error);
  }
};

// Update complaint status (Admin only)
export const updateComplaintStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await prisma.complaint.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};
