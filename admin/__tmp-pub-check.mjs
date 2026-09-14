import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1200 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);

await page.goto(`${base}/playbook/tech/publishing`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const t = await page.locator('main').innerText();
console.log('chars:', t.length);
console.log('cards:', await page.locator('main [class*="rounded"]').count());
console.log('text head:', t.replace(/\s+/g, ' ').slice(0, 300));
console.log('errors:', errs.slice(0, 3));
await page.screenshot({ path: 'C:/tmp/pub.png', fullPage: true });
await browser.close();
