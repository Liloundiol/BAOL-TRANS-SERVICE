import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Get all packages
export const getPackages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const packages = await prisma.package.findMany({
      where: req.user?.role === 'STUDENT' ? { senderId: req.user.userId } : undefined,
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
    const { senderId, tripId, receiverPhone, receiverName, description, weight, price, packageType } = req.body;

    let finalSenderId = senderId || req.user?.userId;
    let finalPrice = price;

    if (packageType === 'VALISE_SAC') {
      finalPrice = 4000;
    } else if (packageType === 'DOCUMENT') {
      finalPrice = 2500;
    } else if (req.user?.role === 'STUDENT' || !finalPrice) {
      // Fallback if no packageType is provided
      finalPrice = Math.max(1000, weight * 500);
    }

    const newPackage = await prisma.package.create({
      data: {
        senderId: finalSenderId,
        tripId,
        receiverPhone,
        receiverName,
        description,
        weight,
        price: finalPrice,
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

// Pay for a package
export const payPackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { packageId, waveTransactionId, amount } = req.body;

    if (!packageId || !waveTransactionId) {
      res.status(400).json({ success: false, message: 'ID colis et transaction Wave requis' });
      return;
    }

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: { payment: true }
    });

    if (!pkg) {
      res.status(404).json({ success: false, message: 'Colis introuvable' });
      return;
    }

    if (pkg.payment && pkg.payment.status === 'COMPLETED') {
      res.status(400).json({ success: false, message: 'Ce colis est déjà payé' });
      return;
    }

    if (pkg.status === 'DELIVERED' || pkg.status === 'CANCELLED') {
      res.status(400).json({ success: false, message: 'Ce colis est livré ou annulé' });
      return;
    }

    // Créer le paiement
    const payment = await prisma.payment.create({
      data: {
        packageId,
        waveTransactionId,
        amount: amount || pkg.price,
        status: 'COMPLETED'
      }
    });

    res.json({ success: true, package: pkg, payment });
  } catch (error) {
    next(error);
  }
};
