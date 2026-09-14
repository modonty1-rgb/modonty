// PAY-E5/E6/E8 live: send the tax invoice email from the order page (to Khalid's inbox), open the WhatsApp message, audit rows.
import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient(); const BASE = 'http://localhost:3001'; const OUT = 'C:/tmp/pay-e8-evidence';
const INBOX = process.argv[2]; if (!INBOX) throw new Error('pass inbox email');
const inv = await db.invoice.findFirst({ where: { number: 'MOD-2026-00017' }, select: { id: true, clientId: true, orderId: true } });
const client = await db.client.findUnique({ where: { id: inv.clientId }, select: { email: true } });
await db.client.update({ where: { id: inv.clientId }, data: { email: INBOX } });
const until = async (label, check) => { const t0 = Date.now(); while (Date.now() - t0 < 45000) { const v = await check(); if (v) { console.log(`✓ ${label} (${Date.now() - t0}ms)`); return v; } await new Promise((r) => setTimeout(r, 500)); } throw new Error('timeout ' + label); };
const browser = await chromium.launch(); const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: 'C:/tmp/pay-a1-evidence/state.json' }); const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 300)));
try {
  await page.goto(`${BASE}/orders/${inv.orderId}`, { waitUntil: 'load', timeout: 90000 }); await page.waitForSelector('main'); await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {}); await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/order-with-invoice-buttons.png`, fullPage: false });
  console.log('buttons:', JSON.stringify(await page.locator('main button, main a[href^="https://wa.me"]').allTextContents()));
  const wa = await page.locator('a[href^="https://wa.me"]').getAttribute('href');
  console.log('whatsapp href:', wa.slice(0, 40) + '…', '| decoded text:', decodeURIComponent(wa.split('text=')[1]).replace(/\n/g, ' / '));
  // email
  await page.getByRole('button', { name: /إرسال الفاتورة بالإيميل/ }).click();
  await until('invoice.emailSentAt set', async () => (await db.invoice.findUnique({ where: { id: inv.id }, select: { emailSentAt: true } })).emailSentAt);
  console.log('audit invoice.send:', JSON.stringify(await db.auditLog.findFirst({ where: { action: 'invoice.send', entityId: inv.id }, orderBy: { createdAt: 'desc' }, select: { userEmail: true, summary: true, metadata: true } })));
  // whatsapp click → audit
  const [popup] = await Promise.all([ctx.waitForEvent('page'), page.locator('a[href^="https://wa.me"]').click()]);
  await popup.close().catch(() => {});
  console.log('audit invoice.whatsapp:', JSON.stringify(await until('invoice.whatsapp audit row', async () => db.auditLog.findFirst({ where: { action: 'invoice.whatsapp', entityId: inv.id }, select: { userEmail: true, summary: true } }))));
  await page.reload({ waitUntil: 'load' }); await page.waitForSelector('main'); await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/order-after-send.png`, fullPage: false });
  console.log('badge after send:', await page.locator('main').getByText(/الفاتورة: MOD-2026-00017/).textContent());
} finally {
  await db.client.update({ where: { id: inv.clientId }, data: { email: client.email } });
  console.log('client email restored to', client.email);
  await browser.close(); await db.$disconnect();
}
