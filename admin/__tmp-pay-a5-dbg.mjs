import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: 'C:/tmp/pay-a1-evidence/state.json' });
const page = await ctx.newPage();
await page.goto('http://localhost:3001/commercial-features', { waitUntil: 'networkidle' });
const info = await page.evaluate(() => {
  const inputs = [...document.querySelectorAll('input[type=hidden][name=icon]')];
  return { count: inputs.length, sample: inputs.slice(-2).map(i => ({ form: i.getAttribute('form'), value: i.value })), rows: document.querySelectorAll('tbody tr').length, hasA5: document.body.innerText.includes('ميزة اختبار A5') };
});
console.log(JSON.stringify(info));
await browser.close();
