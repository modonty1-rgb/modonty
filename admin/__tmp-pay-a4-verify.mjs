import { chromium } from '@playwright/test';
const BASE = 'http://localhost:3001';
const OUT = 'C:/tmp/pay-a4-evidence';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: 'C:/tmp/pay-a1-evidence/state.json' });
const page = await context.newPage();

await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(0).click();
await page.waitForTimeout(300);

// Open the theme select to see the swatches.
const panel = page.locator('article.rounded-xl').nth(0);
const combos = panel.locator('button[role="combobox"]');
const themeCombo = combos.nth(1); // 0=tier, 1=theme
await themeCombo.click();
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT}/01-theme-dropdown-open.png` });

// Pick PRIMARY (2nd option: NEUTRAL, PRIMARY, ACCENT, PREMIUM)
await page.locator('[role="option"]').nth(1).click();
await page.waitForTimeout(150);
await panel.locator('button:has-text("حفظ بيانات الباقة")').click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/02-after-save-primary.png`, fullPage: true });

await context.close();
await browser.close();
console.log('DONE');
