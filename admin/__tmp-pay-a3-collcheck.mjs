import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const list = await db.$runCommandRaw({ listCollections: 1, filter: { name: 'commercial_plan_terms' } });
console.log('commercial_plan_terms exists:', (list.cursor?.firstBatch ?? []).length > 0);
const policies = await db.commercialTermPolicy.findMany({ select: { paidMonths: true, bonusServiceMonths: true } , orderBy: { displayOrder: 'asc' }});
console.log('policies:', JSON.stringify(policies));
await db.$disconnect();
