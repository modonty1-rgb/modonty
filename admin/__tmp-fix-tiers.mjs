import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
for (const [name, tier] of [['الانطلاقة', 'STANDARD'], ['الزخم', 'PRO'], ['الريادة', 'PREMIUM']]) await db.commercialPlan.updateMany({ where: { name }, data: { tier } });
console.log('plans:', JSON.stringify(await db.commercialPlan.findMany({ select: { name: true, tier: true, isPublished: true }, orderBy: { displayOrder: 'asc' } })));
console.log('client:', JSON.stringify(await db.client.findFirst({ where: { email: 'seed-test-order-paid@example.test' }, select: { id: true, createdAt: true, openingBalance: true, invoices: { select: { number: true, fromOpeningBalance: true } } } })));
console.log('order:', JSON.stringify(await db.checkoutOrder.findFirst({ where: { buyerEmail: 'seed-test-order-paid@example.test' }, select: { number: true, createdAt: true, paidAt: true, clientId: true, invoiceId: true } })));
await db.$disconnect();
