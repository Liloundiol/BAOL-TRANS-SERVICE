import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.reservation.findMany().then(console.log).finally(() => prisma.$disconnect());
