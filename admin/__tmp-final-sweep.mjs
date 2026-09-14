import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);

const pages = [
  '/playbook', '/playbook/what-is-modonty', '/playbook/brand', '/playbook/briefs',
  '/playbook/content-structure', '/playbook/article-journey', '/playbook/authority',
  '/playbook/media', '/playbook/reels', '/playbook/after-publish',
  '/playbook/tech', '/playbook/tech/publishing', '/playbook/tech/seo-score',
  '/playbook/tech/image-seo', '/playbook/tech/search-preview', '/playbook/tech/client-articles',
  '/playbook/prohibitions', '/playbook/who-we-serve', '/playbook/what-client-gets',
  '/playbook/golden-rules', '/playbook/sales', '/playbook/marketing', '/playbook/onboarding',
];
let bad = 0;
for (const p of pages) {
  const r = await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const status = r?.status();
  if (status !== 200 || errs.length) bad++;
  console.log(`${status}  ${p}${errs.length ? '  ERR:' + errs[0].slice(0, 70) : ''}`);
  errs.length = 0;
}
console.log('bad pages:', bad, 'of', pages.length);

const g = await page.goto(`${base}/guidelines`, { waitUntil: 'domcontentloaded' });
console.log('/guidelines →', g?.status());

await page.goto(`${base}/playbook`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const dead = await page.locator('aside a[href^="/guidelines"]').count();
console.log('dead sidebar links to guidelines:', dead);
await browser.close();
