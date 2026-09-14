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
await page.waitForTimeout(3000);

const pages = [
  '/playbook/tech/publishing', '/playbook/tech/seo-score', '/playbook/tech/image-seo',
  '/playbook/tech/search-preview', '/playbook/tech/client-articles', '/playbook/prohibitions',
  '/guidelines',
];
for (const p of pages) {
  const res = await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const t = await page.locator('main').innerText();
  console.log(`${res?.status()}  chars=${String(t.length).padStart(6)}  ${p}${errs.length ? '  ERR:' + errs[0].slice(0, 70) : ''}`);
  errs.length = 0;
}

const res = await page.goto(`${base}/guidelines`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
console.log(JSON.stringify({
  guidelines: res?.status(),
  headings: await page.locator('main h2').allInnerTexts(),
  sidebarGuidelineItems: await page.locator('aside a[href^="/guidelines/"]').count(),
}, null, 1));

await browser.close();
