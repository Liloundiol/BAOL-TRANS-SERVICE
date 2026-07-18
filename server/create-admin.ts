import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@baoltrans.sn';
  const adminPhone = '+221770000000';
  const rawPassword = 'admin123';

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(rawPassword, salt);

  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { phoneNumber: adminPhone }
      ]
    }
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { role: 'ADMIN', passwordHash: passwordHash }
    });
    console.log('Admin account updated with new password!');
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        phoneNumber: adminPhone,
        passwordHash: passwordHash,
        firstName: 'Admin',
        lastName: 'BTS',
        role: 'ADMIN'
      }
    });
    console.log('Admin account created!');
  }

  console.log('--- CREDENTIALS ---');
  console.log(`Phone: ${adminPhone}`);
  console.log(`Password: ${rawPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
