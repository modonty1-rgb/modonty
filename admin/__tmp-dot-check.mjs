import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(2500);

for (const p of ['/playbook/what-is-modonty', '/guidelines', '/guidelines/brand']) {
  const res = await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const t = await page.locator('main').innerText();
  console.log(JSON.stringify({
    path: p,
    status: res?.status(),
    dotStory: t.includes('لماذا النقطة'),
    dotPromise: t.includes('من النقطة الأولى إلى النقطة الأخيرة'),
    errors: errs.slice(0, 2),
  }));
  errs.length = 0;
}
await browser.close();
