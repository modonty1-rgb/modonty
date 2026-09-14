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

for (const p of ['/playbook', '/playbook/sales', '/playbook/brand', '/playbook/client-setup']) {
  await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const links = await page.locator('aside a').count();
  const plainText = await page.locator('aside div.flex.items-center.gap-2.rounded-md').count();
  const anchors = await page.locator('aside a[href^="#"]').evaluateAll((els) => els.map((a) => a.getAttribute('href').slice(1)));
  const deadAnchors = await page.evaluate((ids) => ids.filter((id) => !document.getElementById(id)), anchors);
  const active = await page.locator('aside a.bg-primary').allInnerTexts();
  console.log(JSON.stringify({ path: p, links, nonClickableItems: plainText, anchors: anchors.length, deadAnchors, active }));
  errs.length = 0;
}
console.log('errors:', errs.slice(0, 2));
await page.goto(`${base}/playbook/sales`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.locator('aside').first().screenshot({ path: 'C:/tmp/sidebar-clean.png' });
await browser.close();
