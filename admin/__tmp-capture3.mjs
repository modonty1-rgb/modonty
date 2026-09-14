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

const toggle = page.locator('button[aria-label="فتح إعدادات الباقة"]').first();
await toggle.click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'C:/tmp/ultra-ui-evidence/after-open-dedup.png', fullPage: true });

// count "المدد والهدايا" headings
const count = await page.locator('h3:has-text("المدد والهدايا")').count();
console.log('duration section headings count:', count);

// check duplicate DOM ids
const dupIds = await page.evaluate(() => {
  const ids = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
  const seen = {}; const dups = [];
  for (const id of ids) { seen[id] = (seen[id]||0)+1; }
  for (const [id,c] of Object.entries(seen)) if (c>1) dups.push([id,c]);
  return dups;
});
console.log('duplicate ids:', JSON.stringify(dupIds));

// click delete on first term, expect confirm dialog
const deleteBtn = page.locator('button:has-text("حذف")').first();
await deleteBtn.click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'C:/tmp/ultra-ui-evidence/after-delete-confirm.png', fullPage: true });
const dialogVisible = await page.locator('role=alertdialog').count();
console.log('alertdialog count after clicking حذف:', dialogVisible);

await context.close();
await browser.close();
console.log('done');
