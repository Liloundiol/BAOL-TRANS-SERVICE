import prisma from '../config/prisma';

export const addLoyaltyPoints = async (userId: string, points: number, description: string) => {
  try {
    let account = await prisma.loyaltyAccount.findUnique({
      where: { userId }
    });

    if (!account) {
      account = await prisma.loyaltyAccount.create({
        data: {
          userId,
          points: 0,
          tier: 'BRONZE'
        }
      });
    }

    const newTotal = account.points + points;
    let tier = account.tier;

    if (newTotal >= 500) {
      tier = 'GOLD';
    } else if (newTotal >= 100) {
      tier = 'SILVER';
    }

    await prisma.$transaction([
      prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          points: newTotal,
          tier
        }
      }),
      prisma.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: account.id,
          points,
          description
        }
      })
    ]);

    return { success: true, newTotal, tier };
  } catch (error) {
    console.error('Erreur lors de l\\'ajout des points de fidélité:', error);
    return { success: false, error };
  }
};
