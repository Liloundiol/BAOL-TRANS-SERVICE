import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Démarrage de la réinitialisation de la base de données...');

  await prisma.$transaction(async (tx) => {
    // 1. Delete dependents of reservations and users
    console.log('Suppression des tickets, paiements et packages...');
    await tx.ticket.deleteMany({});
    await tx.payment.deleteMany({});
    await tx.package.deleteMany({});
    
    // 2. Delete reservations
    console.log('Suppression des réservations...');
    await tx.reservation.deleteMany({});

    // 3. Delete user dependents
    console.log('Suppression des notifications et comptes de fidélité...');
    await tx.notification.deleteMany({});
    await tx.loyaltyTransaction.deleteMany({});
    await tx.loyaltyAccount.deleteMany({});

    // 4. Delete trip dependents
    console.log("Suppression des bus et points d'embarquement...");
    await tx.bus.deleteMany({});
    await tx.boardingPoint.deleteMany({});

    // 5. Delete core models
    console.log('Suppression des trajets (Trips)...');
    await tx.trip.deleteMany({});
    
    console.log('Suppression des utilisateurs...');
    await tx.user.deleteMany({});
  });

  console.log('Réinitialisation terminée avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
