import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
console.log(JSON.stringify(await db.subscriptionTierConfig.findMany({ select: { tier: true, name: true } })));
await db.$disconnect();
