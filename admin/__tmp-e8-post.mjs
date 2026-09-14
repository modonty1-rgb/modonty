import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const inv = await db.invoice.findFirst({ where: { number: 'MOD-2026-00017' }, select: { id: true, emailSentAt: true, issuedAt: true, totalMinor: true, vatMinor: true } });
console.log('invoice:', JSON.stringify(inv));
console.log('audit invoice.send:', JSON.stringify(await db.auditLog.findFirst({ where: { action: 'invoice.send', entityId: inv.id }, orderBy: { createdAt: 'desc' }, select: { userEmail: true, summary: true, metadata: true, createdAt: true } })));
await db.$disconnect();
