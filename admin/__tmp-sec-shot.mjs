import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/JBR-PAY-DASH.html');
await page.waitForTimeout(400);
await page.screenshot({ path: 'C:/tmp/ultra-ui-evidence/sec-admin.png' });
const vis = async () => (await page.locator('[data-sec]:not(.hidden)').getAttribute('data-sec'));
console.log('default section:', await vis());
await page.click('[data-sec-btn="site"]'); await page.waitForTimeout(250);
console.log('after click site:', await vis(), '· visible cards:', await page.locator('[data-sec]:not(.hidden) .card').count());
await page.screenshot({ path: 'C:/tmp/ultra-ui-evidence/sec-site.png' });
// الهاش يفتح قسم البطاقة الصحيح من أي قسم
await page.goto('file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/JBR-PAY-DASH.html#PAY-Q6'); await page.waitForTimeout(300);
console.log('hash PAY-Q6 →', await vis());
await page.goto('file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/JBR-PAY-DASH.html#PAY-A3'); await page.waitForTimeout(300);
console.log('hash PAY-A3 →', await vis());
console.log('errors:', errs.length);
await browser.close();
