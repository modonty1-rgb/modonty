import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const plans = await db.commercialPlan.findMany({ select: { id: true, name: true, tier: true, isPublished: true }, orderBy: { displayOrder: 'asc' } });
console.log(JSON.stringify(plans, null, 2));
await db.$disconnect();
