import { PrismaClient } from '@prisma/client';

async function checkDatabase() {
  // Get the actual DATABASE_URL being used
  const dbUrl = process.env.DATABASE_URL || "NOT SET";
  console.log("\n=== DATABASE CHECK ===\n");
  console.log("DATABASE_URL:", dbUrl);
  console.log("Database Name:", dbUrl.includes("modonty_dev") ? "✅ modonty_dev (DEV)" : "❌ modonty (PRODUCTION)");
  
  const prisma = new PrismaClient();
  try {
    const clientCount = await prisma.client.count();
    const articleCount = await prisma.article.count();
    
    console.log("\nData in Database:");
    console.log("- Clients:", clientCount);
    console.log("- Articles:", articleCount);
    console.log("\n" + (clientCount > 0 ? "⚠️  DATA FOUND - This is PRODUCTION" : "✅ EMPTY - This is DEVELOPMENT"));
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
