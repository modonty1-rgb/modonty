// Founding vs renewal invoice flag — live through the real "إصدار الفاتورة" button.
import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient(); const BASE = 'http://localhost:3001';
const snap = { market: 'SA', currency: 'SAR', planSlug: 'x', planName: 'الانطلاقة', planTier: 'STANDARD', articlesPerMonth: 4, monthlyBaseMinor: 39900, paidMonths: 6, bonusServiceMonths: 1, subtotalMinor: 208174, vatRateBp: 1500, vatMinor: 31226, totalMinor: 239400, status: 'PAID', paidAt: new Date() };
const mk = async (suffix, seq) => db.checkoutOrder.create({ data: { number: `ORD-2026-9${seq}`, buyerName: `اختبار ${suffix}`, buyerEmail: `founding-${suffix}@example.test`, buyerPhone: '+966500000099', ...snap } });
const cleanup = async () => { for (const s of ['new', 'old']) { const c = await db.client.findFirst({ where: { email: `founding-${s}@example.test` }, select: { id: true } }); if (c) { await db.invoice.deleteMany({ where: { clientId: c.id } }); await db.client.delete({ where: { id: c.id } }); } } await db.checkoutOrder.deleteMany({ where: { buyerEmail: { startsWith: 'founding-' } } }); };
await cleanup();
// case A: client created AFTER the order (founding) · case B: client created long before (renewal)
const oA = await mk('new', '01'); await new Promise((r) => setTimeout(r, 50));
const cA = await db.client.create({ data: { name: 'اختبار new', slug: 'founding-new', email: 'founding-new@example.test', phone: '+966500000091', password: 'x', subscriptionTier: 'STANDARD', openingBalance: 2394, subscriptionStatus: 'PENDING' } });
await db.checkoutOrder.update({ where: { id: oA.id }, data: { clientId: cA.id } });
const cB = await db.client.create({ data: { name: 'اختبار old', slug: 'founding-old', email: 'founding-old@example.test', phone: '+966500000092', password: 'x', subscriptionTier: 'STANDARD', openingBalance: 4788, subscriptionStatus: 'ACTIVE', createdAt: new Date('2025-01-01') } });
const oB = await mk('old', '02'); await db.checkoutOrder.update({ where: { id: oB.id }, data: { clientId: cB.id } });

const browser = await chromium.launch(); const ctx = await browser.newContext({ storageState: 'C:/tmp/pay-a1-evidence/state.json' }); const page = await ctx.newPage(); page.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 300)));
for (const [label, o] of [['A founding', oA], ['B renewal', oB]]) {
  await page.goto(`${BASE}/orders/${o.id}`, { waitUntil: 'load', timeout: 90000 }); await page.waitForSelector('main'); await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'إصدار الفاتورة' }).click();
  const t0 = Date.now(); let inv = null; while (Date.now() - t0 < 30000 && !inv) { inv = await db.invoice.findFirst({ where: { orderId: o.id }, select: { number: true, fromOpeningBalance: true, tier: true, tierName: true, amount: true } }); if (!inv) await new Promise((r) => setTimeout(r, 400)); }
  console.log(label, JSON.stringify(inv));
}
await browser.close(); await cleanup(); console.log('cleanup done · orders left:', await db.checkoutOrder.count({ where: { buyerEmail: { startsWith: 'founding-' } } })); await db.$disconnect();
