import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1100 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);

const routes = [
  '/playbook/sales',
  '/playbook/sales/who-we-serve',
  '/playbook/sales/what-we-sell',
  '/playbook/sales/scripts',
  '/playbook/sales/golden-rules',
  '/playbook/sales/marketing',
  '/playbook',
];
for (const p of routes) {
  const r = await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  console.log(`${r?.status()}  ${p}${errs.length ? '  ERR:' + errs[0].slice(0, 60) : ''}`);
  errs.length = 0;
}

console.log('--- القديمة يجب 404 ---');
for (const p of ['/playbook/golden-rules', '/playbook/who-we-serve', '/playbook/marketing', '/playbook/what-client-gets']) {
  const r = await page.goto(base + p, { waitUntil: 'domcontentloaded' });
  console.log(`${r?.status()}  ${p}`);
}

await page.goto(`${base}/playbook/sales`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const cards = await page.locator('main a[href^="/playbook/sales/"]').count();
const active = await page.locator('aside a.bg-primary').allInnerTexts();
console.log('section cards:', cards, '· active sidebar:', JSON.stringify(active));
await page.screenshot({ path: 'C:/tmp/sales-section.png', fullPage: true });
await browser.close();
