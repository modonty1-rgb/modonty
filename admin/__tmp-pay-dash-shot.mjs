import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1050 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/JBR-PAY-DASH.html');
await page.waitForTimeout(400);
await page.screenshot({ path: 'C:/tmp/ultra-ui-evidence/pay-dash-top.png' });
// اقفز إلى السؤال المطلوب عبر الصندوق البارز
await page.click('.nextq');
await page.waitForTimeout(400);
await page.screenshot({ path: 'C:/tmp/ultra-ui-evidence/pay-dash-q2.png' });
console.log('cards:', await page.locator('.card').count(), '· sidebar links:', await page.locator('.apptab').count(), '· errors:', errs.length);
console.log('nextq href:', await page.locator('.nextq').getAttribute('href'));
await browser.close();
