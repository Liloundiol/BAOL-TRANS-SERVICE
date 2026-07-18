const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.update({
    where: { phoneNumber: '770000000' },
    data: { passwordHash: hash }
  });
  console.log('Password successfully reset to admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
