import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const r = await db.commercialPlan.deleteMany({ where: { name: 'باقة اختبار PAY-A4' } });
console.log('deleted:', r.count);
await db.$disconnect();
