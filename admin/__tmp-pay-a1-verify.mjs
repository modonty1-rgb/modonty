import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3001';
const EMAIL = 'claude-check@modonty.local';
const PASSWORD = 'Mdnty-Local-Check-2026!';
const OUT = 'C:/tmp/pay-a1-evidence';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type=email]', EMAIL);
await page.fill('input[type=password]', PASSWORD);
await page.click('button[type=submit]');
await page.waitForLoadState('networkidle');
console.log('after login url:', page.url());

await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${OUT}/01-list.png`, fullPage: true });

const toggle = page.locator('button[aria-label="فتح إعدادات الباقة"]').first();
await toggle.click();
await page.waitForTimeout(400);

const section = page.locator('section', { has: page.locator('h3', { hasText: 'بيانات الباقة' }) }).first();
const nameInput = section.locator('input[name="name"]');
const descInput = section.locator('textarea[name="description"]');
const badgeInput = section.locator('input[name="badge"]');

const originalName = await nameInput.inputValue();
console.log('original name:', originalName);

await descInput.fill('خطة تناسب المشاريع المتوسطة — محتوى ومقالات شهرية بجودة ثابتة.');
await badgeInput.fill('الأكثر طلباً');
await section.screenshot({ path: `${OUT}/02-section-filled.png` });

await Promise.all([
  page.waitForLoadState('networkidle'),
  section.locator('button:has-text("حفظ بيانات الباقة")').click(),
]);
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/03-after-save.png`, fullPage: true });

await context.close();
await browser.close();
console.log('DONE');
