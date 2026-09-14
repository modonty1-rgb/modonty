import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const r = await db.commercialFeature.deleteMany({ where: { name: 'ميزة اختبار A5' } });
console.log('deleted test features:', r.count, '| features now:', await db.commercialFeature.count());
await db.$disconnect();
