import { chromium } from '@playwright/test';
const base = 'http://localhost:3001';
const routes = ['/playbook','/playbook/persona','/playbook/prohibitions','/playbook/onboarding',
'/playbook/tech','/playbook/tech/client-articles','/playbook/tech/image-seo','/playbook/tech/publishing','/playbook/tech/search-preview','/playbook/tech/seo-score',
'/playbook/sales','/playbook/sales/who-we-serve','/playbook/sales/what-we-sell','/playbook/sales/catalog','/playbook/sales/compare','/playbook/sales/scripts','/playbook/sales/golden-rules','/playbook/sales/client-setup',
'/playbook/marketing','/playbook/marketing/plan','/playbook/marketing/measurement',
'/playbook/content','/playbook/content/briefs','/playbook/content/structure','/playbook/content/article-journey','/playbook/content/authority','/playbook/content/reels','/playbook/content/after-publish',
'/playbook/design','/playbook/design/brand','/playbook/design/media'];
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 110)));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 110)));
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
let bad = 0, totalCodes = 0;
for (const p of routes) {
  const r = await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const t = await page.locator('main').innerText();
  const codes = t.match(/\b[A-Z]{3,10}-\d{2}\b/g) || [];
  totalCodes += codes.length;
  if (r?.status() !== 200 || errs.length || codes.length) {
    bad++; console.log(`${r?.status()} ${p}  رموز=${codes.length} ${codes.slice(0,3)} ${errs[0] ? 'ERR:'+errs[0] : ''}`);
  }
  errs.length = 0;
}
console.log(`\n${routes.length} رابطًا | مشاكل: ${bad} | رموز إنجليزية ظاهرة: ${totalCodes}`);
await browser.close();
