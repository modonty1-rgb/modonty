import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/JBR-PAY-DASH.html');
await page.waitForTimeout(400);
await page.screenshot({ path: 'C:/tmp/ultra-ui-evidence/stage1-board.png' });
console.log('errors:', errs.length, '· p1 cards:', await page.locator('#grp-pay-p1 .card').count());
await browser.close();
