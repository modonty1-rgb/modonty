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

const routes = ['/playbook', '/playbook/sales', '/playbook/sales/compare', '/playbook/sales/catalog', '/playbook/marketing', '/playbook/marketing/measurement'];
for (const p of routes) {
  const r = await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const t = await page.locator('main').innerText();
  console.log(`${r?.status()}  chars=${String(t.length).padStart(6)}  ${p}${errs.length ? '  ERR:' + errs[0].slice(0, 60) : ''}`);
  errs.length = 0;
}

await page.goto(`${base}/playbook`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const home = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
console.log(JSON.stringify({
  homeSections: await page.locator('main section[id]').evaluateAll((e) => e.map((x) => x.id)),
  salesLeftInHome: ['الوكالة الإعلانية', 'حد الباقة', 'ألبوم أعمالنا'].filter((x) => home.includes(x)),
  marketingLeftInHome: ['Search Console'].filter((x) => home.includes(x)),
}));
await browser.close();
