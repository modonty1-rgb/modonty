import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const c = await db.client.findFirst({ where: { email: 'info@kimazone.com' }, select: { id: true } });
const rows = await db.bookingRequest.findMany({ where: { clientId: c.id, channel: 'form' }, select: { name: true, status: true }, orderBy: { createdAt: 'desc' } });
for (const r of rows) console.log(`  • ${r.name} → ${r.status}`);
console.log('واتساب:', await db.bookingRequest.count({ where: { clientId: c.id, channel: 'whatsapp' } }));
await db.$disconnect();
