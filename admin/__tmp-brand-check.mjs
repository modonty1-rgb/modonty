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
await page.waitForTimeout(3000);

for (const p of ['/playbook/brand', '/playbook/briefs']) {
  const res = await page.goto(base + p, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const t = await page.locator('main').innerText();
  console.log(`${res?.status()}  chars=${t.length}  tone=${t.includes('افعل')}  colors=${t.includes('#0e065a') || t.includes('كحلي')}  ${p}${errs.length ? '  ERR:' + errs[0].slice(0, 90) : ''}`);
  errs.length = 0;
}
await browser.close();
