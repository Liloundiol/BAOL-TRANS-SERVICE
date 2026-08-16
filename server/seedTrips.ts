import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test trips...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 30, 0, 0);

  // Trajet 1: Dakar -> Bambey (Tomorrow)
  const trip1 = await prisma.trip.create({
    data: {
      departure: 'Dakar',
      destination: 'Bambey',
      date: tomorrow,
      time: new Date('1970-01-01T08:00:00.000Z'),
      price: 2500,
      status: 'ACTIVE',
      buses: {
        create: [
          {
            busNumber: 'BTS-001',
            capacity: 13,
            status: 'AVAILABLE'
          }
        ]
      }
    }
  });

  // Trajet 2: Bambey -> Dakar (Next Week)
  const trip2 = await prisma.trip.create({
    data: {
      departure: 'Bambey',
      destination: 'Dakar',
      date: nextWeek,
      time: new Date('1970-01-01T14:30:00.000Z'),
      price: 2500,
      status: 'ACTIVE',
      buses: {
        create: [
          {
            busNumber: 'BTS-002',
            capacity: 13,
            status: 'AVAILABLE'
          }
        ]
      }
    }
  });

  console.log('Created trips:', trip1.id, trip2.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
