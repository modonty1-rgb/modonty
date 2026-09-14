import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);

await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const inHeader = await page.locator('header a[href="/playbook"]').count();
const headerText = await page.locator('header a[href="/playbook"]').first().innerText().catch(() => '');
await page.locator('header button').last().click();
await page.waitForTimeout(900);
const menuItems = await page.locator('[role="menuitem"]').allInnerTexts();

console.log(JSON.stringify({
  playbookLinksInHeader: inHeader,
  headerText: headerText.trim(),
  avatarMenu: menuItems,
  errors: errs.slice(0, 2),
}));
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
await page.locator('header').screenshot({ path: 'C:/tmp/admin-header.png' });

const r = await page.goto(`${base}/playbook`, { waitUntil: 'networkidle' });
console.log('click target →', r?.status());
await browser.close();
