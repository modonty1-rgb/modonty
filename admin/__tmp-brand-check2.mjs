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

const r = await page.goto(`${base}/playbook/brand`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const t = await page.locator('main').innerText();
console.log(JSON.stringify({
  status: r?.status(),
  chars: t.length,
  colors: (t.match(/#[0-9a-f]{6}/gi) || []).length,
  fonts: ['Tajawal', 'Montserrat'].filter((x) => t.includes(x)).length,
  logo: t.includes('اللوقو: افعل') && t.includes('اللوقو: لا تفعل'),
  fillerGone: !t.includes('لماذا تقرأ هذي الصفحة'),
  errors: errs.slice(0, 2),
}));
await page.screenshot({ path: 'C:/tmp/brand-slim.png', fullPage: true });
await browser.close();
