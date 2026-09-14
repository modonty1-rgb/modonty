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
await page.waitForTimeout(3000);

const res = await page.goto(`${base}/guidelines`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const links = await page.locator('main a[href^="/guidelines/"]').evaluateAll((els) => els.map((a) => a.getAttribute('href')));
console.log(JSON.stringify({
  status: res?.status(),
  chars: (await page.locator('main').innerText()).length,
  cards: links,
  errors: errs.slice(0, 3),
}, null, 1));
await page.screenshot({ path: 'C:/tmp/guidelines-index.png', fullPage: true });

console.log('--- كل صفحة ---');
for (const href of links) {
  const r = await page.goto(base + href, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const t = await page.locator('main').innerText();
  console.log(`${r?.status()}  chars=${String(t.length).padStart(5)}  ${href}${errs.length ? '  ERR:' + errs[0].slice(0, 60) : ''}`);
  errs.length = 0;
}

await browser.close();
