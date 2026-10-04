import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  console.log('Démarrage du nettoyage de la base de données...');

  try {
    // Ordre de suppression pour respecter les clés étrangères
    console.log('Suppression des tickets...');
    await prisma.ticket.deleteMany({});

    console.log('Suppression des paiements...');
    await prisma.payment.deleteMany({});

    console.log('Suppression des réclamations...');
    await prisma.complaint.deleteMany({});

    console.log('Suppression des avis...');
    await prisma.review.deleteMany({});

    console.log('Suppression des notifications...');
    await prisma.notification.deleteMany({});

    console.log('Suppression des transactions de fidélité...');
    await prisma.loyaltyTransaction.deleteMany({});

    console.log('Suppression des comptes de fidélité...');
    await prisma.loyaltyAccount.deleteMany({});

    console.log('Suppression des colis...');
    await prisma.package.deleteMany({});

    console.log('Suppression des réservations...');
    await prisma.reservation.deleteMany({});

    console.log('Suppression des bus...');
    await prisma.bus.deleteMany({});

    console.log('Suppression des points de montée...');
    await prisma.boardingPoint.deleteMany({});

    console.log('Suppression des points de descente...');
    await prisma.dropoffPoint.deleteMany({});

    console.log('Suppression des trajets...');
    await prisma.trip.deleteMany({});

    console.log('Suppression des utilisateurs (sauf ADMIN)...');
    await prisma.user.deleteMany({
      where: {
        role: {
          not: 'ADMIN',
        },
      },
    });

    console.log('✅ Nettoyage terminé avec succès !');
  } catch (error) {
    console.error('Erreur lors du nettoyage :', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
