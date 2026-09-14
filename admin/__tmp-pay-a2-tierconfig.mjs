import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const configs = await db.subscriptionTierConfig.findMany({ select: { tier: true, name: true } });
console.log(JSON.stringify(configs, null, 2));
await db.$disconnect();
