import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const all = await db.commercialPlan.findMany({ select: { name: true, tier: true, isPublished: true }, orderBy: { displayOrder: 'asc' } });
console.log('all plans:', JSON.stringify(all, null, 2));
const published = await db.commercialPlan.findMany({ where: { isPublished: true }, select: { name: true, tier: true } });
console.log('published (name,tier):', JSON.stringify(published, null, 2));
const tiers = published.map(p => p.tier);
console.log('unique tiers among published:', new Set(tiers).size === tiers.length);
await db.$disconnect();
