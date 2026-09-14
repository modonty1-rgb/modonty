import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3001';
const OUT = 'C:/tmp/pay-a1-evidence';

const browser = await chromium.launch();

async function shot(scheme, label) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme, storageState: `${OUT}/state.json` });
  const page = await context.newPage();
  await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
  const toggle = page.locator('button[aria-label="فتح إعدادات الباقة"]').first();
  await toggle.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${label}.png`, fullPage: true });
  await context.close();
}

await shot('light', 'desktop-light');
await shot('dark', 'desktop-dark');

await browser.close();
console.log('DONE');
