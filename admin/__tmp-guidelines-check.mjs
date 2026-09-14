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

const res = await page.goto(`${base}/guidelines`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const text = await page.locator('main').innerText();
const headings = await page.locator('main h2').allInnerTexts();
const probes = ['أول أسبوع', 'المبيعات', 'ما يراه العميل', 'ستّ جمل', 'العملاء المثاليون'];

console.log(JSON.stringify({
  status: res?.status(),
  chars: text.length,
  headings,
  stillPresent: probes.filter((p) => text.includes(p)),
  errors: errs.slice(0, 3),
}, null, 1));

await browser.close();
