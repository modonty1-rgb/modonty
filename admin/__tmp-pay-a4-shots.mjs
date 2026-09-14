import { chromium } from '@playwright/test';
const BASE = 'http://localhost:3001'; const OUT = 'C:/tmp/pay-a4-evidence';
const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme, storageState: 'C:/tmp/pay-a1-evidence/state.json' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
  await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(0).click();
  await page.waitForTimeout(400);
  const panel = page.locator('article.rounded-xl').nth(0);
  await panel.locator('button[role="combobox"]').nth(1).click();
  await page.waitForTimeout(300);
  const opts = await page.locator('[role="option"]').allTextContents();
  console.log(scheme, 'theme options:', JSON.stringify(opts));
  await page.screenshot({ path: `${OUT}/theme-select-${scheme}.png`, fullPage: false });
  await ctx.close();
}
await browser.close(); console.log('DONE');
