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

const live = [
  '/guidelines', '/guidelines/authors', '/guidelines/media', '/guidelines/reels', '/guidelines/after-publish',
  '/playbook', '/playbook/what-is-modonty', '/playbook/article-journey', '/playbook/content-structure',
  '/playbook/brand', '/playbook/briefs', '/playbook/tech', '/playbook/prohibitions',
  '/playbook/who-we-serve', '/playbook/golden-rules', '/playbook/sales', '/playbook/marketing',
  '/playbook/onboarding', '/playbook/what-client-gets',
];
for (const p of live) {
  const r = await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  console.log(`${r?.status()}  ${p}${errs.length ? '  ERR:' + errs[0].slice(0, 60) : ''}`);
  errs.length = 0;
}

console.log('--- المحذوفة (يجب 404) ---');
for (const p of ['/guidelines/articles', '/guidelines/brand', '/guidelines/prohibitions', '/guidelines/icps']) {
  const r = await page.goto(base + p, { waitUntil: 'domcontentloaded' });
  console.log(`${r?.status()}  ${p}`);
}
await browser.close();
