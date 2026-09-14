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

const res = await page.goto(`${base}/playbook/persona`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const t = await page.locator('main').innerText();

console.log(JSON.stringify({
  status: res?.status(),
  chars: t.length,
  role: t.includes('زميل خبير في المحتوى'),
  dimensions: ['رسمي', 'مرح', 'جريء', 'متحمّس'].filter((x) => t.includes(x)).length,
  traits: ['خبير يشرح، لا يتعالى', 'صريح مسنود برقم', 'قريب بلا تكلّف'].filter((x) => t.includes(x)).length,
  readerStates: ['مرتبك', 'محبط', 'متحمّس', 'مستعجل', 'مرتاب'].filter((x) => t.includes(x)).length,
  antiPersona: t.includes('ما ليست مدونتي'),
  sources: t.includes('Nielsen Norman') && t.includes('Mailchimp'),
  errors: errs.slice(0, 3),
}));

await page.goto(`${base}/playbook`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
console.log('linked from home:', await page.locator('main a[href="/playbook/persona"]').count(),
  '· sidebar:', await page.locator('aside a[href="/playbook/persona"]').count());
await page.goto(`${base}/playbook/persona`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: 'C:/tmp/persona.png', fullPage: true });
await browser.close();
