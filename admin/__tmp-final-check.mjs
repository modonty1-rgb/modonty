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

for (const p of ['/playbook/brand', '/playbook/briefs']) {
  const res = await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const t = await page.locator('main').innerText();
  console.log(`${res?.status()}  chars=${t.length}  ${p}${errs.length ? '  ERR:' + errs[0].slice(0, 70) : ''}`);
  errs.length = 0;
}

for (const p of ['/guidelines/brand', '/guidelines/briefs']) {
  await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  console.log(`${p}  →  ${page.url().replace(base, '')}`);
}

const res = await page.goto(`${base}/guidelines`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const t = await page.locator('main').innerText();
console.log(JSON.stringify({
  guidelines: res?.status(),
  chars: t.length,
  headings: await page.locator('main h2').allInnerTexts(),
  leftovers: ['النبرة', 'الألوان', 'الخطوط', 'البريف'].filter((x) => t.includes(x)),
  errors: errs.slice(0, 2),
}, null, 1));

await browser.close();
