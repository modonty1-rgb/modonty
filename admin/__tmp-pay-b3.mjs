// PAY-B3 — the order is a snapshot: change the price from the admin screen, delete the plan; the order must not move.
import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient(); const BASE = 'http://localhost:3001';
const PLAN = 'باقة اختبار B3';
await db.checkoutOrder.deleteMany({ where: { planName: PLAN } });
await db.commercialPlan.deleteMany({ where: { name: PLAN } });
const plan = await db.commercialPlan.create({ data: { name: PLAN, slug: `b3-${Date.now()}`, articlesPerMonth: 4, tier: 'STANDARD', highlights: [], displayOrder: 99, prices: { create: [{ market: 'SA', currency: 'SAR', monthlyBase: 399 }, { market: 'EG', currency: 'EGP', monthlyBase: 1199 }] } }, include: { prices: true } });
const term = await db.commercialTermPolicy.findUnique({ where: { paidMonths: 6 } });
const sa = plan.prices.find((p) => p.market === 'SA');
// snapshot exactly as build-order-snapshot does (mirrored here because this is an .mjs script; the TS module is exercised in __tmp-pay-b2.ts)
const monthlyBaseMinor = sa.monthlyBase * 100, totalMinor = monthlyBaseMinor * term.paidMonths, subtotalMinor = Math.round((totalMinor * 10000) / 11500), vatMinor = totalMinor - subtotalMinor;
const counter = await db.counter.upsert({ where: { key: 'order-2026' }, create: { key: 'order-2026', value: 1 }, update: { value: { increment: 1 } } });
const order = await db.checkoutOrder.create({ data: { number: `ORD-2026-${String(counter.value).padStart(5, '0')}`, market: 'SA', currency: 'SAR', buyerName: 'مشتري اختبار', buyerEmail: 'b3@example.com', buyerPhone: '+966500000000', planId: plan.id, planSlug: plan.slug, planName: plan.name, planTier: plan.tier, articlesPerMonth: 4, monthlyBaseMinor, paidMonths: term.paidMonths, bonusServiceMonths: term.bonusServiceMonths, subtotalMinor, vatRateBp: 1500, vatMinor, totalMinor, status: 'AWAITING_PAYMENT' } });
console.log('1 order created:', order.number, JSON.stringify({ monthlyBaseMinor, totalMinor, subtotalMinor, vatMinor }));

// 2 · price change FROM THE ADMIN SCREEN (399 → 450)
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: 'C:/tmp/pay-a1-evidence/state.json' });
const page = await ctx.newPage();
await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'load', timeout: 90000 }); await page.waitForSelector('main'); await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {}); await page.waitForTimeout(500);
const idx = (await db.commercialPlan.findMany({ select: { name: true }, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] })).findIndex((p) => p.name === PLAN);
await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(idx).click(); await page.waitForTimeout(400);
const panel = page.locator('article.rounded-xl').nth(idx);
await panel.locator('input[name=sa]').fill('450');
await panel.locator('button:has-text("حفظ الأساس")').click();
const t0 = Date.now(); while (Date.now() - t0 < 30000) { const p = await db.commercialPlanPrice.findFirst({ where: { planId: plan.id, market: 'SA' } }); if (p.monthlyBase === 450) break; await new Promise((r) => setTimeout(r, 400)); }
console.log('2 price now:', (await db.commercialPlanPrice.findFirst({ where: { planId: plan.id, market: 'SA' } })).monthlyBase);
await browser.close();
const after = await db.checkoutOrder.findUnique({ where: { id: order.id }, select: { monthlyBaseMinor: true, totalMinor: true, subtotalMinor: true, vatMinor: true } });
console.log('3 order after price change:', JSON.stringify(after));

// 4 · delete the plan → order survives
await db.commercialPlan.delete({ where: { id: plan.id } });
const orphan = await db.checkoutOrder.findUnique({ where: { id: order.id }, select: { number: true, planId: true, planName: true, totalMinor: true } });
console.log('4 order after plan delete:', JSON.stringify(orphan), '| plan rows:', await db.commercialPlan.count({ where: { id: plan.id } }));
await db.checkoutOrder.delete({ where: { id: order.id } });
console.log('cleanup → orders:', await db.checkoutOrder.count(), '| plans:', await db.commercialPlan.count());
await db.$disconnect(); console.log('DONE');
