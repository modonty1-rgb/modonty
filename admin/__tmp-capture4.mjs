import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const email = 'ui-ux-temp-tester@modonty.local';
const password = 'Temp-UiUx-2026!';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' });
const page = await context.newPage();
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[name="email"], input[type="email"]', email);
await page.fill('input[name="password"], input[type="password"]', password);
await page.click('button[type="submit"]');
await page.waitForTimeout(1500);

await page.goto(`${base}/commercial-plans`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.locator('button[aria-label="فتح إعدادات الباقة"]').first().click();
await page.waitForTimeout(300);
await page.locator('button:has-text("حذف")').first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'C:/tmp/ultra-ui-evidence/after-color-fix.png', fullPage: true });

const bg = await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('نعم، احذف'));
  return btn ? getComputedStyle(btn).backgroundColor : null;
});
console.log('confirm button bg:', bg);
await context.close();
await browser.close();
