import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);

for (const p of ['/guidelines/publishing', '/guidelines/seo-score', '/guidelines/image-seo', '/guidelines/seo-visual', '/guidelines/client-articles', '/guidelines/brand', '/guidelines/icps']) {
  await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  console.log(`${p.padEnd(32)} →  ${page.url().replace(base, '')}`);
}
await browser.close();
