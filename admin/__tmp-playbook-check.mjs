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

const newPages = ['/playbook', '/playbook/what-is-modonty', '/playbook/who-we-serve', '/playbook/golden-rules', '/playbook/sales', '/playbook/marketing', '/playbook/onboarding', '/playbook/what-client-gets'];
for (const p of newPages) {
  const res = await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const len = (await page.locator('main').innerText()).length;
  console.log(`${res?.status()}  chars=${String(len).padStart(6)}  ${p}${errs.length ? '  ERR:' + errs[0].slice(0, 80) : ''}`);
  errs.length = 0;
}

console.log('--- redirects from guidelines ---');
for (const p of ['/guidelines/icps', '/guidelines/golden-rules', '/guidelines/sales-playbook', '/guidelines/marketing-strategy', '/guidelines/team-onboarding', '/guidelines/clients', '/guidelines/positioning']) {
  await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  console.log(`${p}  →  ${page.url().replace(base, '')}`);
}

await browser.close();
