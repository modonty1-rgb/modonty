import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const s = await db.staff.findUnique({ where: { email: 'claude-check@modonty.local' }, select: { id: true, role: true, isActive: true } });
console.log('staff:', JSON.stringify(s));
const plans = await db.commercialPlan.findMany({ select: { name: true, theme: true, tier: true, isPublished: true, displayOrder: true }, orderBy: { displayOrder: 'asc' } });
console.log('plans:', JSON.stringify(plans));
console.log('policies:', JSON.stringify(await db.commercialTermPolicy.findMany({ select: { paidMonths: true, bonusServiceMonths: true } })));
await db.$disconnect();
