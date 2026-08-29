import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const name = (await db.$runCommandRaw({ dbStats: 1 })).db;
if (name !== 'modonty_dev') { console.log('توقّف: ' + name); process.exit(1); }
const c = await db.client.findFirst({ where: { email: 'info@kimazone.com' }, select: { id: true } });
const art = await db.article.findFirst({ where: { clientId: c.id }, select: { id: true } });
const made = await db.bookingRequest.createMany({ data: [
  { clientId: c.id, articleId: art.id, source: 'article_dock', channel: 'form', name: 'سارة المصري', phone: '+201001234567', message: 'أبغى أعرف أسعار تصنيع الشامبو بكميات صغيرة.', status: 'new' },
  { clientId: c.id, source: 'client_page', channel: 'form', name: 'ندى حسن', phone: '+201119876543', message: 'ممكن نتكلم بخصوص خط إنتاج كامل؟', status: 'contacted' },
] });
console.log(`قاعدة: ${name} · أُنشئ: ${made.count} طلب تواصل`);
await db.$disconnect();
