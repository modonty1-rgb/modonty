import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const plan = await db.commercialPlan.findFirst({ where: { name: { contains: 'الانطلاقة' } }, select: { id: true, slug: true, name: true, description: true, badge: true, features: { select: { id: true } } } });
console.log(JSON.stringify(plan, null, 2));
console.log('featuresCount:', plan?.features?.length);
await db.$disconnect();
