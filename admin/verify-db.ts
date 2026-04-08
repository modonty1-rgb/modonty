import { PrismaClient } from '@prisma/client';

async function verify() {
  const prisma = new PrismaClient();
  try {
    const clients = await prisma.client.count();
    console.log("\n✅ VERIFICATION COMPLETE");
    console.log("Database: " + (clients === 0 ? "modonty_dev (DEV) ✅" : "modonty (PROD) ❌"));
    console.log("Clients found:", clients);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
