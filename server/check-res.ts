import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const reservations = await prisma.reservation.findMany({
    include: { user: true, bus: { include: { trip: true } } }
  });
  console.log('Reservations count:', reservations.length);
  console.log(reservations.map(r => ({ id: r.id, userId: r.userId, status: r.status })));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
