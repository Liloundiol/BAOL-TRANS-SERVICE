import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Get all packages
export const getPackages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const packages = await prisma.package.findMany({
      include: {
        sender: true,
        trip: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, packages });
  } catch (error) {
    next(error);
  }
};

// Create a new package
export const createPackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { senderId, tripId, receiverPhone, receiverName, description, weight, price } = req.body;

    const newPackage = await prisma.package.create({
      data: {
        senderId,
        tripId,
        receiverPhone,
        receiverName,
        description,
        weight,
        price,
        status: 'PENDING'
      },
      include: {
        sender: true,
        trip: true
      }
    });

    res.status(201).json({ success: true, package: newPackage });
  } catch (error) {
    next(error);
  }
};

// Update package status
export const updatePackageStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: { status },
      include: {
        sender: true,
        trip: true
      }
    });

    res.json({ success: true, package: updatedPackage });
  } catch (error) {
    next(error);
  }
};

// Delete a package
export const deletePackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };

    await prisma.package.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Colis supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};
