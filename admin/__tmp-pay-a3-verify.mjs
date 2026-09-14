import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3001';
const OUT = 'C:/tmp/pay-a3-evidence';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: 'C:/tmp/pay-a1-evidence/state.json' });
const page = await context.newPage();

await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${OUT}/01-list-with-global-terms.png`, fullPage: true });

// Edit the "12 months" gift from ONE place (the new global policy section).
const rows = page.locator('table tr').filter({ has: page.locator('input[name="paidMonths"]') });
const count = await rows.count();
console.log('policy rows:', count);
// find the row where paidMonths input value = 12
let target = null;
for (let i = 0; i < count; i++) {
  const val = await rows.nth(i).locator('input[name="paidMonths"]').inputValue();
  if (val === '12') { target = rows.nth(i); break; }
}
if (!target) throw new Error('12-month policy row not found');
await target.locator('input[name="bonusMonths"]').fill('7');
await target.locator('button:has-text("حفظ")').click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);

await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
// Open each plan panel to confirm the read table reflects the new gift everywhere.
const toggles = page.locator('button[aria-label="فتح إعدادات الباقة"]');
const n = await toggles.count();
for (let i = 0; i < n; i++) { await toggles.nth(i).click(); await page.waitForTimeout(200); }
await page.screenshot({ path: `${OUT}/02-all-plans-open-readonly-terms.png`, fullPage: true });

// Dark mode
const darkContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark', storageState: 'C:/tmp/pay-a1-evidence/state.json' });
const darkPage = await darkContext.newPage();
await darkPage.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
const darkToggle = darkPage.locator('button[aria-label="فتح إعدادات الباقة"]').first();
await darkToggle.click();
await darkPage.waitForTimeout(300);
await darkPage.screenshot({ path: `${OUT}/03-dark.png`, fullPage: true });
await darkContext.close();

await context.close();
await browser.close();
console.log('DONE');
