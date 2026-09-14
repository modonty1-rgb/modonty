import { chromium } from '@playwright/test';

const url = 'http://localhost:3001/commercial-plans';
const browser = await chromium.launch();

for (const scheme of ['light', 'dark']) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `C:/tmp/ultra-ui-evidence/commercial-plans-${scheme}-closed.png`, fullPage: true });

  // try to open first plan panel
  const toggle = page.locator('button[aria-label="فتح إعدادات الباقة"]').first();
  if (await toggle.count() > 0) {
    await toggle.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `C:/tmp/ultra-ui-evidence/commercial-plans-${scheme}-open.png`, fullPage: true });
  }
  await context.close();
}

await browser.close();
console.log('done');
