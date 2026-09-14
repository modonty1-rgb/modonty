import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
console.log('features named A10:', JSON.stringify(await db.commercialFeature.findMany({ where: { name: { startsWith: 'ميزة A10' } }, select: { id: true, name: true, createdAt: true } })));
const plan = await db.commercialPlan.findFirst({ where: { name: 'باقة اختبار A10' }, select: { id: true, features: { select: { id: true, displayOrder: true, featureId: true, feature: { select: { name: true } } } } } });
console.log('plan features:', JSON.stringify(plan?.features));
await db.$disconnect();
