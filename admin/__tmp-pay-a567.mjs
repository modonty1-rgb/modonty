import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
const BASE = 'http://localhost:3001'; const OUT = 'C:/tmp/pay-a567-evidence';
const db = new PrismaClient();
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: 'C:/tmp/pay-a1-evidence/state.json' });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

// ── A5/A6: create a feature with unit + description + icon ──────────────────
await page.goto(`${BASE}/commercial-features`, { waitUntil: 'networkidle' });
// keep exactly one test feature (a re-run must not create a second)
const dupes = await db.commercialFeature.findMany({ where: { name: 'ميزة اختبار A5' }, select: { id: true }, orderBy: { createdAt: 'asc' } });
if (dupes.length > 1) await db.commercialFeature.deleteMany({ where: { id: { in: dupes.slice(1).map((d) => d.id) } } });
let created = await db.commercialFeature.findFirst({ where: { name: 'ميزة اختبار A5' }, select: { id: true, name: true, unitLabel: true, description: true, icon: true, displayOrder: true } });
if (!created) {
  await page.fill('#create-feature input[name=name]', 'ميزة اختبار A5');
  await page.fill('#create-feature input[name=unitLabel]', 'مقال');
  await page.fill('#create-feature input[name=description]', 'وصف اختبار');
  await page.locator('button[aria-label="أيقونة الميزة"]').first().click();
  await page.getByRole('option', { name: 'Article', exact: true }).click();
  await page.locator('#create-feature button[type=submit]').click();
  await page.waitForLoadState('networkidle'); await page.waitForTimeout(600);
  created = await db.commercialFeature.findFirst({ where: { name: 'ميزة اختبار A5' }, select: { id: true, name: true, unitLabel: true, description: true, icon: true, displayOrder: true } });
}
console.log('A5/A6 created:', JSON.stringify(created));
await page.goto(`${BASE}/commercial-features`, { waitUntil: 'networkidle' });

// ── A5: invalid icon name is rejected ───────────────────────────────────────
const formId = `feature-${created.id}`;
await page.evaluate((fid) => { const i = document.querySelector(`input[type=hidden][name=icon][form="${fid}"]`); i.value = 'IconDoesNotExist'; }, formId);
await page.locator(`button[form="${formId}"][type=submit]`).click();
await page.waitForLoadState('networkidle'); await page.waitForTimeout(800);
const bodyText = await page.locator('body').innerText();
console.log('A5 invalid icon -> error shown:', /أيقونة غير موجودة في السجلّ/.test(bodyText), '| DB icon still:', (await db.commercialFeature.findUnique({ where: { id: created.id }, select: { icon: true } })).icon);
await page.screenshot({ path: `${OUT}/a5-invalid-icon-error.png` });
const tryAgain = page.locator('button:has-text("Try Again")'); if (await tryAgain.count()) await tryAgain.click();

// ── A7: reorder features — move the new (last) feature up once ───────────────
await page.goto(`${BASE}/commercial-features`, { waitUntil: 'networkidle' });
const before = await db.commercialFeature.findMany({ select: { name: true, displayOrder: true }, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] });
console.log('features before:', before.map((f) => `${f.displayOrder}:${f.name}`).join(' | '));
await page.locator(`button[aria-label="تقديم «ميزة اختبار A5»"]`).click();
await page.waitForLoadState('networkidle'); await page.waitForTimeout(600);
const after = await db.commercialFeature.findMany({ select: { name: true, displayOrder: true }, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] });
console.log('features after up:', after.map((f) => `${f.displayOrder}:${f.name}`).join(' | '));
for (const scheme of ['light', 'dark']) { const c2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme, storageState: 'C:/tmp/pay-a1-evidence/state.json' }); const p2 = await c2.newPage(); await p2.goto(`${BASE}/commercial-features`, { waitUntil: 'networkidle' }); await p2.screenshot({ path: `${OUT}/features-${scheme}.png`, fullPage: true }); await c2.close(); }

// ── A7: reorder plans — third plan to first ─────────────────────────────────
await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
const plansBefore = await db.commercialPlan.findMany({ select: { name: true, displayOrder: true }, orderBy: { displayOrder: 'asc' } });
console.log('plans before:', plansBefore.map((p) => `${p.displayOrder}:${p.name}`).join(' | '));
const third = plansBefore[2].name;
await page.locator(`button[aria-label="تقديم «${third}»"]`).click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(500);
await page.locator(`button[aria-label="تقديم «${third}»"]`).click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(500);
const plansAfter = await db.commercialPlan.findMany({ select: { name: true, displayOrder: true }, orderBy: { displayOrder: 'asc' } });
console.log('plans after 2×up:', plansAfter.map((p) => `${p.displayOrder}:${p.name}`).join(' | '));
console.log('first-button disabled for first plan:', await page.locator(`button[aria-label="تقديم «${plansAfter[0].name}»"]`).isDisabled());
await page.screenshot({ path: `${OUT}/plans-reordered.png`, fullPage: false });
// restore original order
await page.locator(`button[aria-label="تأخير «${third}»"]`).click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(500);
await page.locator(`button[aria-label="تأخير «${third}»"]`).click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(500);
console.log('plans restored:', (await db.commercialPlan.findMany({ select: { name: true, displayOrder: true }, orderBy: { displayOrder: 'asc' } })).map((p) => `${p.displayOrder}:${p.name}`).join(' | '));

await ctx.close(); await browser.close(); await db.$disconnect(); console.log('DONE');
