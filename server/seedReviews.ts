import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedReviews() {
  console.log('Seeding reviews...');
  
  // Find an admin user to attach the reviews to, or just the first user
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('No user found to attach reviews. Please create a user first.');
    return;
  }

  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Application super pratique ! J'ai pu réserver mon billet pour Touba en 2 minutes avec Wave. Fini les longues files d'attente à la gare.",
      userId: user.id
    }
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: "Les bus sont confortables et partent toujours à l'heure. Je voyage chaque semaine entre Dakar et Saint-Louis avec eux.",
      userId: user.id
    }
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Le service client est très réactif. J'ai eu un imprévu et ils m'ont aidé à modifier ma réservation très rapidement.",
      userId: user.id
    }
  });

  console.log('Successfully seeded 3 reviews!');
}

seedReviews()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
