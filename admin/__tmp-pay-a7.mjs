import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
const BASE = 'http://localhost:3001'; const OUT = 'C:/tmp/pay-a567-evidence';
const db = new PrismaClient();
// restore the canonical plan order first (previous run left it scrambled by the timed-out transaction)
for (const [i, name] of ['الانطلاقة', 'الزخم', 'الريادة'].entries()) await db.commercialPlan.updateMany({ where: { name }, data: { displayOrder: i } });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: 'C:/tmp/pay-a1-evidence/state.json' });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 160)));
const list = async (m) => (await db[m].findMany({ select: { name: true, displayOrder: true }, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] })).map((p) => `${p.displayOrder}:${p.name}`).join(' | ');
// A server-action submit is a POST; wait for ITS response, not for "network idle" (which fired before the POST even began — measured).
const clickRow = async (label) => { const t0 = Date.now(); const done = page.waitForResponse((r) => r.request().method() === 'POST', { timeout: 30000 }); await page.locator(`button[aria-label="${label}"]`).first().click(); await done; await page.waitForLoadState('networkidle'); await page.waitForTimeout(300); return Date.now() - t0; };

// features: last → up once
await page.goto(`${BASE}/commercial-features`, { waitUntil: 'networkidle' });
console.log('features tail before:', (await list('commercialFeature')).split(' | ').slice(-3).join(' | '));
console.log('feature up ms:', await clickRow('تقديم «ميزة اختبار A5»'));
console.log('features tail after :', (await list('commercialFeature')).split(' | ').slice(-3).join(' | '));
await clickRow('تأخير «ميزة اختبار A5»');
console.log('features restored   :', (await list('commercialFeature')).split(' | ').slice(-3).join(' | '));

// plans: third → first
await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
console.log('plans before:', await list('commercialPlan'));
console.log('plan up ms:', await clickRow('تقديم «الريادة»'), await clickRow('تقديم «الريادة»'));
console.log('plans after 2×up:', await list('commercialPlan'));
console.log('up disabled on first:', await page.locator('button[aria-label="تقديم «الريادة»"]').first().isDisabled());
for (const scheme of ['light', 'dark']) { const c2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme, storageState: 'C:/tmp/pay-a1-evidence/state.json' }); const p2 = await c2.newPage(); await p2.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' }); await p2.screenshot({ path: `${OUT}/plans-reordered-${scheme}.png`, fullPage: false }); await c2.close(); }
await clickRow('تأخير «الريادة»'); await clickRow('تأخير «الريادة»');
console.log('plans restored:', await list('commercialPlan'));
await ctx.close(); await browser.close(); await db.$disconnect(); console.log('DONE');
