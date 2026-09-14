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

const res = await page.goto(`${base}/playbook`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const t = await page.locator('main').innerText();
const links = await page.locator('main a[href^="/playbook/"]').evaluateAll((els) => [...new Set(els.map((a) => a.getAttribute('href')))]);

console.log(JSON.stringify({
  status: res?.status(),
  h1: await page.locator('main h1').first().innerText().catch(() => ''),
  sections: await page.locator('main section[id]').evaluateAll((els) => els.map((e) => e.id)),
  directoryLinks: links.length,
  chars: t.length,
  errors: errs.slice(0, 3),
}));
errs.length = 0;

let bad = 0;
for (const href of links) {
  const r = await page.goto(base + href, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  if (r?.status() !== 200) { bad++; console.log('BAD', r?.status(), href); }
}
console.log('broken links:', bad, 'of', links.length);

const gone = await page.goto(`${base}/playbook/what-is-modonty`, { waitUntil: 'domcontentloaded' });
console.log('/playbook/what-is-modonty →', gone?.status());
await browser.close();
