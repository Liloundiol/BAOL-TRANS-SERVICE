import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getFinanceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all completed payments
    const payments = await prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      select: { amount: true, paidAt: true }
    });

    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthRevenue = 0;

    payments.forEach(p => {
      const amount = Number(p.amount);
      totalRevenue += amount;
      
      const paidDate = new Date(p.paidAt);
      if (paidDate >= startOfDay) {
        todayRevenue += amount;
      }
      if (paidDate >= startOfMonth) {
        monthRevenue += amount;
      }
    });

    res.json({
      totalRevenue,
      todayRevenue,
      monthRevenue,
      transactionsCount: payments.length
    });
  } catch (error) {
    console.error('Error fetching finance stats:', error);
    res.status(500).json({ message: 'Erreur serveur lors du calcul des statistiques' });
  }
};

export const getRecentPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { paidAt: 'desc' },
      include: {
        reservation: {
          include: {
            user: { select: { firstName: true, lastName: true, phoneNumber: true } },
            bus: { include: { trip: { select: { departure: true, destination: true } } } }
          }
        },
        package: {
          include: {
            sender: { select: { firstName: true, lastName: true, phoneNumber: true } },
            trip: { select: { departure: true, destination: true } }
          }
        }
      },
      take: 100 // Limit to recent 100 to avoid huge payloads
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des transactions' });
  }
};
