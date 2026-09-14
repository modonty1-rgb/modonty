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

const probes = ['النبرة', 'كلمات نتجنّبها', 'Anti-Hooks', 'حوارات تتكرّر', 'الألوان', 'الخطوط', 'اللوقو'];
for (const p of ['/playbook/persona', '/playbook/brand']) {
  const r = await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const t = await page.locator('main').innerText();
  console.log(JSON.stringify({
    path: p,
    status: r?.status(),
    chars: t.length,
    has: probes.filter((x) => t.includes(x)),
    errors: errs.slice(0, 2),
  }));
  errs.length = 0;
}

await page.goto(`${base}/playbook/persona`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
console.log('sidebar persona link:', await page.locator('aside a[href="/playbook/persona"]').count());
await page.locator('aside').screenshot({ path: 'C:/tmp/sidebar.png' });
await browser.close();
