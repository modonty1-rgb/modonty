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

const res = await page.goto(`${base}/playbook/brand`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const t = await page.locator('main').innerText();

console.log(JSON.stringify({
  status: res?.status(),
  chars: t.length,
  owner: t.includes('يملكها قائد المحتوى'),
  axes: ['صريح، لا متحمّس', 'قريب، لا متكلّف'].filter((x) => t.includes(x)).length,
  situations: ['اعتراض على السعر', 'تأخّر تسليم', 'رفض نشر', 'خطأ تقني يخصّنا', 'إعلان ميزة'].filter((x) => t.includes(x)).length,
  rule: t.includes('اقرأ الجملة بصوت عالٍ'),
  oldAbstract: ['Bold and Adaptable', 'Sleek and Purposeful', 'Future-Driven'].filter((x) => t.includes(x)),
  errors: errs.slice(0, 3),
}));

const tone = page.locator('main').locator('text=النبرة — كيف نتكلّم').first();
await tone.scrollIntoViewIfNeeded().catch(() => {});
await page.waitForTimeout(600);
await page.screenshot({ path: 'C:/tmp/brand-tone.png' });
await browser.close();
