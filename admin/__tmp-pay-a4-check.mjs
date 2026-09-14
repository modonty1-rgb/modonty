import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const plans = await db.commercialPlan.findMany({ select: { name: true, theme: true } });
console.log(JSON.stringify(plans, null, 2));
await db.$disconnect();
