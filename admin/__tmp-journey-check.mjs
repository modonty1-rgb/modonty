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
await page.waitForTimeout(3000);

const res = await page.goto(`${base}/playbook/article-journey`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const t = await page.locator('main').innerText();
console.log(JSON.stringify({
  status: res?.status(),
  chars: t.length,
  phases: ['الإعداد', 'الكتابة', 'النشر والاعتماد'].filter((p) => t.includes(p)).length,
  limits: ['٨٠ حرف', '١٥٥', '٥١ حرف', '١٤٠', '٨٠٠ كلمة', 'ثلاثة مقالات', '٦٠٪'].filter((x) => t.includes(x)),
  auto: t.includes('يتولّاه النظام'),
  boosters: t.includes('معزّزات الجودة'),
  errors: errs.slice(0, 3),
}));
errs.length = 0;

for (const p of ['/guidelines/articles', '/guidelines/writing']) {
  await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  console.log(`${p}  →  ${page.url().replace(base, '')}`);
}

const r = await page.goto(`${base}/guidelines`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
console.log('guidelines', r?.status(), 'cards=', await page.locator('main a[href^="/guidelines/"]').count(), 'errors=', errs.length);
await browser.close();
