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

const res = await page.goto(`${base}/playbook`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const links = await page.locator('main a[href^="/playbook"]').evaluateAll((els) => els.map((a) => a.getAttribute('href')));
console.log(JSON.stringify({
  status: res?.status(),
  groups: await page.locator('main section').count(),
  cards: links.length,
  startsWith: links[0],
  errors: errs.slice(0, 3),
}));
errs.length = 0;

let bad = 0;
for (const href of [...new Set(links)]) {
  const r = await page.goto(base + href, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  if (r?.status() !== 200) { bad++; console.log('BAD', r?.status(), href); }
}
console.log('broken cards:', bad, 'of', new Set(links).size);

await page.goto(`${base}/playbook`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'C:/tmp/playbook-home.png', fullPage: true });
await browser.close();
