// PAY-A10 — stage-1 closure test: a complete plan from the screens alone, then ONE raw read.
// Every submit is confirmed against the DATABASE (polled), not against network signals: the
// dashboard fires other server actions (notification poll, breadcrumb lookup) that look like ours.
import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
const BASE = 'http://localhost:3001'; const OUT = 'C:/tmp/pay-a10-evidence';
const db = new PrismaClient();
const PLAN = 'باقة اختبار A10'; const FEATS = ['ميزة A10 أولى', 'ميزة A10 ثانية', 'ميزة A10 ثالثة']; const UNITS = ['مقال', 'حملة', 'فيديو']; const ICONS = ['Article', 'Rocket', 'Video']; const QTY = [6, 2, 1];
await db.commercialPlan.deleteMany({ where: { name: PLAN } });
await db.commercialFeature.deleteMany({ where: { name: { in: FEATS } } });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: 'C:/tmp/pay-a1-evidence/state.json' });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 200)));
const go = async (path) => { await page.goto(`${BASE}${path}`, { waitUntil: 'load', timeout: 90000 }); await page.waitForSelector('main', { timeout: 90000 }); await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {}); await page.waitForTimeout(500); };
const until = async (label, check) => { const t0 = Date.now(); while (Date.now() - t0 < 30000) { if (await check()) return console.log(`  ✓ ${label} (${Date.now() - t0}ms)`); await new Promise((r) => setTimeout(r, 400)); } throw new Error(`timeout: ${label}`); };
const submit = async (locator, label, check) => { await locator.click(); await until(label, check); await page.waitForTimeout(500); };
const pickOption = async (trigger, optionName) => { await trigger.click(); await page.getByRole('option', { name: optionName, exact: true }).click(); await page.waitForTimeout(150); };
const planBy = (select) => db.commercialPlan.findFirst({ where: { name: PLAN }, select });

// 1 · plan from the screen
await go('/commercial-plans');
await page.locator('summary:has-text("إضافة باقة جديدة")').click(); await page.waitForTimeout(300);
await page.locator('input[name=name]:visible').first().fill(PLAN); await page.fill('input[name=sa]', '599'); await page.fill('input[name=eg]', '2999'); await page.fill('input[name=articlesPerMonth]', '6');
await submit(page.locator('button:has-text("إنشاء مسودة")'), '1 plan created', async () => !!(await planBy({ id: true })));
const planId = (await planBy({ id: true })).id;

// 2 · plan data
await go('/commercial-plans');
const panelIndex = (await db.commercialPlan.findMany({ select: { name: true }, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] })).findIndex((p) => p.name === PLAN);
await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(panelIndex).click(); await page.waitForTimeout(400);
let panel = page.locator('article.rounded-xl').nth(panelIndex);
await panel.locator('textarea[name=description]').fill('وصف باقة الاختبار A10');
await panel.locator('input[name=badge]').fill('للمؤسسات');
await pickOption(panel.locator('button[role="combobox"]').nth(0), 'الريادة'); // PREMIUM's config name
await pickOption(panel.locator('button[role="combobox"]').nth(1), 'بريميوم');
await submit(panel.locator('button:has-text("حفظ بيانات الباقة")'), '2 plan data saved', async () => (await planBy({ tier: true, theme: true, badge: true })).tier === 'PREMIUM');

// 3 · three features
for (const [i, name] of FEATS.entries()) {
  await go('/commercial-features');
  await page.fill('#create-feature input[name=name]', name); await page.fill('#create-feature input[name=unitLabel]', UNITS[i]); await page.fill('#create-feature input[name=description]', `وصف ${name}`);
  await pickOption(page.locator('button[aria-label="أيقونة الميزة"]').first(), ICONS[i]);
  await submit(page.locator('#create-feature button[type=submit]'), `3 feature ${i + 1} created`, async () => !!(await db.commercialFeature.findFirst({ where: { name } })));
}
// 4 · assign with quantities
for (const [i, name] of FEATS.entries()) {
  await go(`/commercial-plans/${planId}`);
  await page.selectOption('select[name=featureId]', { label: `${name} (${UNITS[i]})` });
  await page.fill('form:has(select[name=featureId]) input[name=quantity]', String(QTY[i]));
  await submit(page.locator('button:has-text("إضافة ميزة")'), `4 feature ${i + 1} assigned`, async () => (await db.commercialPlanFeature.count({ where: { planId } })) === i + 1);
}
// 5 · reorder: third feature → first · plan → first
const orderOf = async (name) => (await db.commercialPlanFeature.findFirst({ where: { planId, feature: { name } }, select: { displayOrder: true } })).displayOrder;
for (const expected of [1, 0]) { await go(`/commercial-plans/${planId}`); await submit(page.locator(`button[aria-label="تقديم «${FEATS[2]}»"]`).first(), `5 feature moved up → ${expected}`, async () => (await orderOf(FEATS[2])) === expected); }
for (let i = panelIndex; i > 0; i--) { await go('/commercial-plans'); await submit(page.locator(`button[aria-label="تقديم «${PLAN}»"]`).first(), `5 plan moved up → ${i - 1}`, async () => (await planBy({ displayOrder: true })).displayOrder === i - 1); }
// 6 · policy from the top section: 12-month bonus 6 → 7 → 6
for (const v of [7, 6]) { await go('/commercial-plans'); const row = page.locator('tr:has(input[name=paidMonths][value="12"])').first(); await row.locator('input[name=bonusMonths]').fill(String(v)); await submit(row.locator('button:has-text("حفظ")'), `6 policy 12 bonus → ${v}`, async () => (await db.commercialTermPolicy.findUnique({ where: { paidMonths: 12 } })).bonusServiceMonths === v); }
// 7 · publish
await go('/commercial-plans');
await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(0).click(); await page.waitForTimeout(400);
panel = page.locator('article.rounded-xl').nth(0);
await submit(panel.getByRole('button', { name: 'نشر', exact: true }), '7 published', async () => (await planBy({ isPublished: true })).isPublished === true);
await go('/commercial-plans'); await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(0).click(); await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/stage1-plan-open-1280.png`, fullPage: true });
await go(`/commercial-plans/${planId}`); await page.screenshot({ path: `${OUT}/stage1-plan-detail-1280.png`, fullPage: true });

// 8 · ONE raw read
const plan = await db.commercialPlan.findUnique({ where: { id: planId }, include: { prices: { select: { market: true, currency: true, monthlyBase: true } }, features: { orderBy: { displayOrder: 'asc' }, select: { quantity: true, displayOrder: true, feature: { select: { name: true, unitLabel: true, icon: true, description: true } } } } } });
console.log('8 RAW PLAN:', JSON.stringify({ name: plan.name, slug: plan.slug, description: plan.description, badge: plan.badge, tier: plan.tier, theme: plan.theme, articlesPerMonth: plan.articlesPerMonth, isPublished: plan.isPublished, displayOrder: plan.displayOrder, prices: plan.prices, features: plan.features }));
console.log('8 RAW POLICIES:', JSON.stringify(await db.commercialTermPolicy.findMany({ orderBy: { displayOrder: 'asc' }, select: { paidMonths: true, bonusServiceMonths: true, isActive: true } })));
console.log('8 published tiers:', JSON.stringify(await db.commercialPlan.findMany({ where: { isPublished: true }, select: { name: true, tier: true } })));

// cleanup
await db.commercialPlan.deleteMany({ where: { name: PLAN } });
await db.commercialFeature.deleteMany({ where: { name: { in: FEATS } } });
for (const [i, name] of ['الانطلاقة', 'الزخم', 'الريادة'].entries()) await db.commercialPlan.updateMany({ where: { name }, data: { displayOrder: i } });
console.log('cleanup → plans:', JSON.stringify(await db.commercialPlan.findMany({ select: { name: true, displayOrder: true, isPublished: true }, orderBy: { displayOrder: 'asc' } })), '| features:', await db.commercialFeature.count());
await ctx.close(); await browser.close(); await db.$disconnect(); console.log('DONE');
