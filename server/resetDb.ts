import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database reset...');

  console.log('Deleting Payments...');
  await prisma.payment.deleteMany({});

  console.log('Deleting Tickets...');
  await prisma.ticket.deleteMany({});

  console.log('Deleting Reservations...');
  await prisma.reservation.deleteMany({});

  console.log('Deleting Packages...');
  await prisma.package.deleteMany({});

  console.log('Deleting BoardingPoints...');
  await prisma.boardingPoint.deleteMany({});

  console.log('Deleting Buses...');
  await prisma.bus.deleteMany({});

  console.log('Deleting Trips...');
  await prisma.trip.deleteMany({});

  console.log('Deleting Notifications...');
  await prisma.notification.deleteMany({});

  console.log('Deleting LoyaltyTransactions...');
  await prisma.loyaltyTransaction.deleteMany({});

  console.log('Deleting LoyaltyAccounts...');
  await prisma.loyaltyAccount.deleteMany({});

  console.log('Deleting non-admin Users...');
  await prisma.user.deleteMany({
    where: {
      role: {
        not: 'ADMIN',
      },
    },
  });

  console.log('✅ Database successfully reset!');
}

main()
  .catch((e) => {
    console.error('Error resetting database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
