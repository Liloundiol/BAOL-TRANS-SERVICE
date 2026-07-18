import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres.eigzgalvmwdsjgjvrumg:Yayefama19072002%40@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
      }
    }
  });

  try {
    const count = await prisma.user.count();
    console.log("Connected successfully! Users count:", count);
  } catch (e) {
    console.error("Connection failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
