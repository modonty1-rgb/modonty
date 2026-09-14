import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);

const res = await page.goto(`${base}/playbook/content-structure`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const t = await page.locator('main').innerText();
console.log(JSON.stringify({
  status: res?.status(),
  chars: t.length,
  hasCategory: t.includes('الفئة'),
  hasTag: t.includes('الوسم'),
  hasIndustry: t.includes('القطاع'),
  hasMistakes: t.includes('أخطاء متكرّرة'),
  errors: errs.slice(0, 3),
}));
errs.length = 0;

await page.goto(`${base}/guidelines/organization`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
console.log('/guidelines/organization →', page.url().replace(base, ''));

const r2 = await page.goto(`${base}/guidelines`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
console.log('guidelines', r2?.status(), 'cards=', await page.locator('main a[href^="/guidelines/"]').count(), 'errors=', errs.length);

await page.screenshot({ path: 'C:/tmp/guidelines-index.png', fullPage: true });
await browser.close();
