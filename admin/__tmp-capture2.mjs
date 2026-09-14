import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const email = 'ui-ux-temp-tester@modonty.local';
const password = 'Temp-UiUx-2026!';
const browser = await chromium.launch();

for (const scheme of ['light', 'dark']) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
  const page = await context.newPage();
  await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  await page.goto(`${base}/commercial-plans`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `C:/tmp/ultra-ui-evidence/commercial-plans-${scheme}-closed.png`, fullPage: true });

  const toggle = page.locator('button[aria-label="فتح إعدادات الباقة"]').first();
  const count = await toggle.count();
  console.log(scheme, 'toggle count', count);
  if (count > 0) {
    await toggle.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `C:/tmp/ultra-ui-evidence/commercial-plans-${scheme}-open.png`, fullPage: true });
  }
  await context.close();
}

await browser.close();
console.log('done');
