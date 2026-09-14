import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1200 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);

const routes = [
  '/playbook',
  '/playbook/persona', '/playbook/prohibitions', '/playbook/tech', '/playbook/onboarding',
  '/playbook/sales', '/playbook/sales/who-we-serve', '/playbook/sales/what-we-sell',
  '/playbook/sales/scripts', '/playbook/sales/golden-rules', '/playbook/sales/client-setup',
  '/playbook/marketing', '/playbook/marketing/plan',
  '/playbook/content', '/playbook/content/briefs', '/playbook/content/structure',
  '/playbook/content/article-journey', '/playbook/content/authority',
  '/playbook/content/reels', '/playbook/content/after-publish',
  '/playbook/design', '/playbook/design/brand', '/playbook/design/media',
];
let bad = 0;
for (const p of routes) {
  const r = await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  if (r?.status() !== 200 || errs.length) { bad++; console.log(`BAD ${r?.status()} ${p} ${errs[0]?.slice(0, 60) ?? ''}`); }
  errs.length = 0;
}
console.log(`routes ok: ${routes.length - bad}/${routes.length}`);

await page.goto(`${base}/playbook/content/reels`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
console.log('sidebar links:', await page.locator('aside a').count(),
  '· active:', JSON.stringify(await page.locator('aside a.bg-primary').allInnerTexts()));
await page.locator('aside').first().screenshot({ path: 'C:/tmp/sidebar-departments.png' });
await browser.close();
