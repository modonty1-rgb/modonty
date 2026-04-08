import { PrismaClient } from '@prisma/client';

async function test() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty_dev?retryWrites=true&w=majority&appName=modonty-cluster"
      }
    }
  });

  try {
    const clientCount = await prisma.client.count();
    const articleCount = await prisma.article.count();
    
    console.log('✅ DATABASE CONNECTION SUCCESSFUL');
    console.log(`📊 Connected to: modonty_dev`);
    console.log(`📈 Clients in DB: ${clientCount}`);
    console.log(`📄 Articles in DB: ${articleCount}`);
  } catch (error) {
    console.error('❌ Connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
