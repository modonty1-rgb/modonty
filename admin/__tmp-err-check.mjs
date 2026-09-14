import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push('pageerror: ' + String(e)));
page.on('console', (m) => m.type() === 'error' && errs.push('console: ' + m.text()));
page.on('requestfailed', (r) => errs.push('reqfail: ' + r.url().replace(base, '') + ' ' + (r.failure()?.errorText ?? '')));

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);
errs.length = 0;

await page.goto(`${base}/guidelines`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
console.log('errors on /guidelines:');
for (const e of errs) console.log(' -', e.slice(0, 200));
await browser.close();
