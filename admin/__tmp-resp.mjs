import { chromium } from '@playwright/test';
const base = 'http://localhost:3001';
const dir = 'C:/Users/w2nad/AppData/Local/Temp/claude/c--Users-w2nad-Desktop-dreamToApp-MODONTY/0cd87a3b-5bf8-4506-a67b-b54e8f6a4fb8/scratchpad/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 }, colorScheme: 'dark' });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
page.on('console', (m) => m.type() === 'error' && !/MaxListeners/.test(m.text()) && errs.push(m.text().slice(0, 120)));
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
for (const [w, h, name] of [[1440, 1100, 'v-wide'], [900, 1100, 'v-mid'], [420, 1100, 'v-narrow']]) {
  await page.setViewportSize({ width: w, height: h });
  const r = await page.goto(base + '/playbook', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.locator('#values').screenshot({ path: dir + name + '.png' });
  const box = await page.locator('#values').boundingBox();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log(`${w}px  status=${r?.status()}  ارتفاع القسم=${Math.round(box.height)}  تجاوز أفقي=${overflow}  errs=${errs.length}`);
  errs.length = 0;
}
await browser.close();
