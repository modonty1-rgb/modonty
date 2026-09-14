import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const r = await db.invoice.updateMany({ where: { number: 'MOD-2026-00017' }, data: { fromOpeningBalance: true } });
console.log('flagged test invoice:', r.count, JSON.stringify(await db.invoice.findFirst({ where: { number: 'MOD-2026-00017' }, select: { number: true, fromOpeningBalance: true, amount: true } })));
await db.$disconnect();
