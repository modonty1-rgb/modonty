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

for (const p of ['/playbook', '/playbook/sales', '/playbook/content', '/playbook/design', '/playbook/marketing', '/playbook/sales/golden-rules']) {
  const r = await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const t = await page.locator('main').innerText();
  console.log(`${r?.status()}  chars=${String(t.length).padStart(6)}  whenLines=${(t.match(/متى تستخدم/g) || []).length}  ${p}${errs.length ? '  ERR:' + errs[0].slice(0, 60) : ''}`);
  errs.length = 0;
}
await browser.close();
