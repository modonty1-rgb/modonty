import { chromium } from '@playwright/test';
const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 100)));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 100)));
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
for (const p of ['/playbook', '/playbook/sales/golden-rules']) {
  const r = await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const t = await page.locator('main').innerText();
  console.log(`${r?.status()}  ${p}`);
  console.log(`   «كالبنيان» = ${(t.match(/كالبنيان/g) || []).length}   «طوبة» = ${(t.match(/طوبة/g) || []).length}   «المجاز الدقيق» = ${(t.match(/المجاز الدقيق/g) || []).length}`);
  if (errs.length) console.log('   ERR:', errs[0]);
  errs.length = 0;
}
await page.goto(base + '/playbook', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
console.log('\n' + (await page.locator('main header p').last().innerText()));
await browser.close();
