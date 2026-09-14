import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);

await page.goto(`${base}/guidelines`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const doc = (await page.locator('main').innerText()).replace(/\s+/g, ' ');

/** مواضيع صارت في الـPlaybook — أي أثر لها هنا تكرار. */
const moved = {
  'النبرة/الهوية': ['افعل ولا تفعل', 'نبرة', 'Purpose', 'الهوية الاستراتيجية'],
  'الشعار والألوان': ['الشعار', 'الألوان', 'الخطوط', 'Tajawal'],
  'البريف': ['البريف'],
  'الممنوعات': ['الممنوعات', 'خط أحمر'],
  'بوّابة النشر': ['بوّابة النشر', 'يمنع النشر'],
  'نتيجة السيو': ['نتيجة السيو', 'درجة السيو'],
  'سيو الصور': ['سيو الصور', 'النص البديل'],
  'شكل المقال في البحث': ['شكل المقال في جوجل', 'معاينة'],
  'مقالات العملاء': ['مقالات العملاء'],
  'أول أسبوع': ['أول أسبوع'],
  'المبيعات': ['المبيعات', 'الإغلاق', 'الاعتراض'],
  'ما يراه العميل': ['ما يراه العميل', 'الكونسول'],
};

const hits = {};
for (const [topic, probes] of Object.entries(moved)) {
  const found = probes.filter((p) => doc.includes(p));
  if (found.length) hits[topic] = found;
}

console.log(JSON.stringify({
  docChars: doc.length,
  headings: await page.locator('main h2').allInnerTexts(),
  duplicateTraces: hits,
}, null, 1));

await browser.close();
