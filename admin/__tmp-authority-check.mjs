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

const res = await page.goto(`${base}/playbook/authority`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const t = await page.locator('main').innerText();
console.log(JSON.stringify({
  status: res?.status(),
  chars: t.length,
  defaultRule: t.includes('المؤلّف الافتراضي'),
  exceptions: ['سلطة المجال', 'شراكة استراتيجية', 'صوت شخصي'].filter((x) => t.includes(x)).length,
  steps: ['ملف الكاتب', 'روابط الحسابات', 'الاتساق'].filter((x) => t.includes(x)).length,
  plan: ['الأساس', 'الحضور الرقمي', 'رسم المعرفة'].filter((x) => t.includes(x)).length,
  errors: errs.slice(0, 3),
}));
errs.length = 0;

const gone = await page.goto(`${base}/guidelines/authors`, { waitUntil: 'domcontentloaded' });
console.log('/guidelines/authors →', gone?.status());

const g = await page.goto(`${base}/guidelines`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
console.log('guidelines', g?.status(), 'cards=', await page.locator('main a[href^="/guidelines/"]').count(), 'errors=', errs.length);
await browser.close();
