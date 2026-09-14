import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);

/** العنصر النشط يحمل خلفية primary — نعدّه في كل صفحة. */
async function activeLinks(path) {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  return page.locator('aside a.bg-primary').evaluateAll((els) => els.map((a) => a.textContent.trim()));
}

for (const p of ['/playbook', '/playbook/persona', '/playbook/brand', '/playbook/tech/seo-score']) {
  const active = await activeLinks(p);
  console.log(`${p.padEnd(26)} active=${active.length}  ${JSON.stringify(active)}`);
}
console.log('errors:', errs.slice(0, 2));
await browser.close();
