import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3001';
const OUT = 'C:/tmp/pay-a2-evidence';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: 'C:/tmp/pay-a1-evidence/state.json' });
const page = await context.newPage();

await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });

const toggles = page.locator('button[aria-label="فتح إعدادات الباقة"]');
const count = await toggles.count();
console.log('plan panels:', count);

// Open first plan (الانطلاقة) and try publishing WITHOUT tier.
await toggles.nth(0).click();
await page.waitForTimeout(300);
const panel1 = page.locator('article.rounded-xl').nth(0);
await panel1.getByRole('button', { name: 'نشر', exact: true }).click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/01-publish-without-tier-error.png`, fullPage: true });
console.log('body text after no-tier publish attempt:', (await page.locator('h2').first().textContent()) || '');

// Reset the error boundary.
const tryAgain = page.locator('button:has-text("Try Again")');
if (await tryAgain.count() > 0) { await tryAgain.click(); await page.waitForTimeout(500); }
await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });

// Set tier=BASIC on plan 1 (الانطلاقة), save.
await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(0).click();
await page.waitForTimeout(300);
let panel = page.locator('article.rounded-xl').nth(0);
await panel.locator('button[role="combobox"]').first().click();
await page.waitForTimeout(200);
await page.locator('[role="option"]').first().click(); // BASIC is first
await page.waitForTimeout(150);
await panel.locator('button:has-text("حفظ بيانات الباقة")').click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(400);
console.log('saved tier for plan 1');

// Now publish plan 1 — should succeed (has tier, no conflict).
await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(0).click();
await page.waitForTimeout(300);
panel = page.locator('article.rounded-xl').nth(0);
await panel.getByRole('button', { name: 'نشر', exact: true }).click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/02-plan1-published.png`, fullPage: true });

// Set tier=BASIC on plan 2 (الزخم) too, then attempt publish -> expect conflict error.
await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(1).click();
await page.waitForTimeout(300);
panel = page.locator('article.rounded-xl').nth(1);
await panel.locator('button[role="combobox"]').first().click();
await page.waitForTimeout(200);
await page.locator('[role="option"]').first().click(); // BASIC
await page.waitForTimeout(150);
await panel.locator('button:has-text("حفظ بيانات الباقة")').click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(400);

await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(1).click();
await page.waitForTimeout(300);
panel = page.locator('article.rounded-xl').nth(1);
await panel.getByRole('button', { name: 'نشر', exact: true }).click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/03-publish-conflict-error.png`, fullPage: true });

// Reset, then correct plan 2's tier to STANDARD (leave a sane draft state), do not publish it.
const tryAgain2 = page.locator('button:has-text("Try Again")');
if (await tryAgain2.count() > 0) { await tryAgain2.click(); await page.waitForTimeout(500); }
await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(1).click();
await page.waitForTimeout(300);
panel = page.locator('article.rounded-xl').nth(1);
await panel.locator('button[role="combobox"]').first().click();
await page.waitForTimeout(200);
await page.locator('[role="option"]').nth(1).click(); // STANDARD
await page.waitForTimeout(150);
await panel.locator('button:has-text("حفظ بيانات الباقة")').click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(400);

// Set tier=PRO on plan 3 (الريادة) as a sane draft default, leave unpublished.
await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(2).click();
await page.waitForTimeout(300);
panel = page.locator('article.rounded-xl').nth(2);
await panel.locator('button[role="combobox"]').first().click();
await page.waitForTimeout(200);
await page.locator('[role="option"]').nth(2).click(); // PRO
await page.waitForTimeout(150);
await panel.locator('button:has-text("حفظ بيانات الباقة")').click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/04-final-state.png`, fullPage: true });

await context.close();
await browser.close();
console.log('DONE');
