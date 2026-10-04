import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('Création des utilisateurs...');
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('passer123', salt);

    // Create Agent
    await prisma.user.upsert({
      where: { phoneNumber: '770000001' },
      update: {},
      create: {
        firstName: 'Agent',
        lastName: 'Test',
        phoneNumber: '770000001',
        passwordHash: hashedPassword,
        role: 'AGENT',
      },
    });
    console.log('Agent créé avec succès (Téléphone: 770000001, Mot de passe: passer123)');

    // Create Controller
    await prisma.user.upsert({
      where: { phoneNumber: '770000002' },
      update: {},
      create: {
        firstName: 'Contrôleur',
        lastName: 'Test',
        phoneNumber: '770000002',
        passwordHash: hashedPassword,
        role: 'CONTROLLER',
      },
    });
    console.log('Contrôleur créé avec succès (Téléphone: 770000002, Mot de passe: passer123)');

    console.log('Terminé !');
  } catch (error) {
    console.error('Erreur :', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
