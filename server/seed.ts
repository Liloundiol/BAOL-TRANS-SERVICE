import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create a trip for today
  const today = new Date();
  
  const trip = await prisma.trip.create({
    data: {
      departure: 'Dakar',
      destination: 'UGB (Saint-Louis)',
      date: today,
      time: today,
      price: 5000,
      status: 'ACTIVE',
      // Create a bus for this trip
      buses: {
        create: {
          busNumber: 'BUS-001',
          capacity: 13,
          status: 'AVAILABLE'
        }
      }
    }
  });

  const trip2 = await prisma.trip.create({
    data: {
      departure: 'UGB (Saint-Louis)',
      destination: 'Dakar',
      date: today,
      time: today,
      price: 5000,
      status: 'ACTIVE',
      buses: {
        create: {
          busNumber: 'BUS-002',
          capacity: 13,
          status: 'AVAILABLE'
        }
      }
    }
  });

  console.log('Database seeded with trips!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
