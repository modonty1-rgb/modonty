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

const pages = ['/playbook/tech', '/playbook/tech/publishing', '/playbook/tech/seo-score', '/playbook/tech/image-seo', '/playbook/tech/search-preview', '/playbook/tech/client-articles'];
for (const p of pages) {
  const res = await page.goto(base + p, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const t = await page.locator('main').innerText();
  console.log(`${res?.status()}  chars=${String(t.length).padStart(5)}  ${p}${errs.length ? '  ERR:' + errs[0].slice(0, 70) : ''}`);
  errs.length = 0;
}

console.log('--- redirects ---');
for (const p of ['/guidelines/publishing', '/guidelines/seo-score', '/guidelines/image-seo', '/guidelines/seo-visual', '/guidelines/client-articles']) {
  await page.goto(base + p, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  console.log(`${p}  →  ${page.url().replace(base, '')}`);
}

const res = await page.goto(`${base}/guidelines`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);
console.log('guidelines', res?.status(), 'sidebarItems=', await page.locator('aside a[href^="/guidelines/"]').count(), 'errors=', errs.length);

await browser.close();
