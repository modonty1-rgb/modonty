import { chromium } from '@playwright/test';
const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
await page.goto(base + '/playbook', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
console.log('— المقدّمة —');
console.log((await page.locator('main header').innerText()).trim());
console.log('\n— الأقسام —');
const secs = await page.locator('main section[id]').all();
for (const s of secs) {
  const lines = (await s.innerText()).trim().split('\n').filter(Boolean);
  console.log(`[${lines[0]}] ${lines[1]}  —  ${(await s.innerText()).length} حرفًا`);
}
await browser.close();
