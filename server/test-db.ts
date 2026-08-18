import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.reservation.findMany({
  where: { paymentProofUrl: { not: null } },
  select: { paymentProofUrl: true }
}).then(console.log).finally(() => prisma.$disconnect());
