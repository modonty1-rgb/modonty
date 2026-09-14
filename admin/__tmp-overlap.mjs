import { chromium } from '@playwright/test';

const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1100 } })).newPage();

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);

async function text(p) {
  await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  return (await page.locator('main').innerText()).replace(/\s+/g, ' ');
}

const home = await text('/playbook');
const targets = {
  'sales/what-we-sell': await text('/playbook/sales/what-we-sell'),
  'sales/golden-rules': await text('/playbook/sales/golden-rules'),
  'sales/who-we-serve': await text('/playbook/sales/who-we-serve'),
  'marketing/plan': await text('/playbook/marketing/plan'),
};

/** عبارات مميّزة من أقسام الرئيسية — أين توجد أيضًا؟ */
const probes = {
  'فيمَ نختلف (معارك)': 'الوكالة الإعلانية',
  'جدول الفرق': 'دومين متراكم الثقة',
  'متى لا نناسب': 'يريد دومينًا باسمه',
  'ماذا نبيع (الكتالوج)': 'حد الباقة',
  'صفحة الشريك': 'ألبوم أعمالنا',
  'القياس': 'Search Console',
};

console.log('القسم في الرئيسية → هل يوجد في صفحة أخرى؟');
for (const [label, probe] of Object.entries(probes)) {
  const inHome = home.includes(probe);
  const elsewhere = Object.entries(targets).filter(([, t]) => t.includes(probe)).map(([k]) => k);
  console.log(`${label.padEnd(24)} home=${inHome}  also=${elsewhere.join(', ') || '—'}`);
}
console.log('home chars:', home.length);
await browser.close();
