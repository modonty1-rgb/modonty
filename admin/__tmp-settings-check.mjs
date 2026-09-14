import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
console.log(JSON.stringify(await db.settings.findUnique({ where: { singletonKey: 'global' }, select: { orgLegalName: true, orgVatNumber: true, orgCommercialRegistrationNumber: true, orgAddressLocality: true, orgStreetAddress: true } })));
console.log(JSON.stringify(await db.invoice.findFirst({ where: { number: 'MOD-2026-00017' }, select: { id: true, clientId: true, emailSentAt: true, client: { select: { email: true, legalName: true, vatID: true } } } })));
await db.$disconnect();
