import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3001';
const OUT = 'C:/tmp/pay-a3-evidence';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: 'C:/tmp/pay-a1-evidence/state.json' });
const page = await context.newPage();

for (let i = 0; i < 3; i++) {
  await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
  await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(i).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/plan-${i}-open.png`, fullPage: true });
}

await context.close();
await browser.close();
console.log('DONE');
