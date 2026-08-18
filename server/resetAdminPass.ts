import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
  });

  if (admins.length === 0) {
    console.log("Aucun administrateur trouvé !");
    return;
  }

  for (const admin of admins) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Bts@2026', salt);
    
    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash },
    });
    
    console.log(`ADMIN: ${admin.phoneNumber} | NOUVEAU MOT DE PASSE: Bts@2026`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
