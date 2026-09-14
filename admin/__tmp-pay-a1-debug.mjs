import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: 'C:/tmp/pay-a1-evidence/state.json' });
const page = await context.newPage();
await page.goto('http://localhost:3001/commercial-plans', { waitUntil: 'networkidle' });
console.log('url:', page.url());
await page.screenshot({ path: 'C:/tmp/pay-a1-evidence/debug.png', fullPage: true });
await browser.close();
