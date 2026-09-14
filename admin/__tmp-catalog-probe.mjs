import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push('pageerror: ' + String(e)));
page.on('console', (m) => m.type() === 'error' && errs.push('console: ' + m.text()));

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);

const r = await page.goto(`${base}/playbook/sales/catalog`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
console.log('status:', r?.status());
console.log('url:', page.url());
console.log('has main:', await page.locator('main').count());
console.log('body head:', (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 400));
console.log('errors:', errs.slice(0, 3));
await browser.close();
