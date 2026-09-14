import { chromium } from '@playwright/test';
const BASE = 'http://localhost:3001';
const OUT = 'C:/tmp/pay-a3-evidence';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: 'C:/tmp/pay-a1-evidence/state.json' });
const page = await context.newPage();
await page.goto(`${BASE}/commercial-plans`, { waitUntil: 'networkidle' });
await page.locator('button[aria-label="فتح إعدادات الباقة"]').nth(0).click();
await page.waitForTimeout(400);
const heading = page.locator('h3:has-text("المدد والهدايا")').nth(1); // second occurrence = read-only per-plan section
await heading.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT}/plan-0-readonly-terms.png` });
await context.close();
await browser.close();
console.log('DONE');
