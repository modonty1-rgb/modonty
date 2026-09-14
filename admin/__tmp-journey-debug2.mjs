import { chromium } from '@playwright/test';
const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1100 }, colorScheme: 'dark' })).newPage();
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
await page.goto(base + '/playbook', { waitUntil: 'domcontentloaded', timeout: 180000 });
await page.waitForSelector('#system', { timeout: 60000 });
await page.waitForTimeout(4000);
const info = await page.evaluate(() => {
  const el = document.querySelector('#system [data-testid="rf__wrapper"]')?.parentElement;
  if (!el) return 'no map div';
  const cs = getComputedStyle(el);
  const surf = document.querySelector('#surfaces [data-testid="rf__wrapper"]')?.parentElement;
  return {
    cls: el.className,
    height: cs.height,
    surfCls: surf?.className,
    surfHeight: surf ? getComputedStyle(surf).height : null,
    nodeCount: document.querySelectorAll('#system .react-flow__node').length,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
