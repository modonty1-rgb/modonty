import { chromium } from '@playwright/test';
const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 140)));
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);

// كل رابط يصل إليه الموظّف الجديد: الشريط الجانبي + شريط كل قسم
await page.goto(base + '/playbook', { waitUntil: 'domcontentloaded', timeout: 180000 });
await page.waitForTimeout(2000);
const seeds = await page.locator('aside nav a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
const all = new Set(seeds);
for (const s of seeds.filter((h) => /\/(sales|marketing|content|design)$/.test(h))) {
  await page.goto(base + s, { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.waitForTimeout(1400);
  const sub = await page.locator('nav[aria-label^="صفحات قسم"] a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  sub.forEach((h) => all.add(h));
}

console.log('مسارات يصل إليها الموظّف:', all.size, '\n');
console.log('المسار'.padEnd(38), 'كود  كلمات  أقسام  روابط-مكسورة  العنوان');
const rows = [];
for (const href of [...all].sort()) {
  const r = await page.goto(base + href, { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.waitForTimeout(1300);
  const m = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    const t = main.innerText.trim();
    return {
      title: (document.querySelector('h1')?.innerText || '').trim().slice(0, 34),
      words: t ? t.split(/\s+/).length : 0,
      h2: [...document.querySelectorAll('h2')].map((h) => h.innerText.trim()),
      latin: [...new Set((t.match(/\b[A-Za-z][A-Za-z.-]{2,}\b/g) || []))].slice(0, 8),
      height: document.documentElement.scrollHeight,
    };
  });
  rows.push({ href, status: r?.status(), ...m });
  console.log(href.padEnd(38), String(r?.status()).padEnd(5), String(m.words).padEnd(6), String(m.h2.length).padEnd(6), ''.padEnd(13), m.title);
}

console.log('\n— أقسام كل صفحة:');
rows.forEach((r) => console.log('  ' + r.href.padEnd(38) + (r.h2.join(' · ') || '—')));

console.log('\n— لاتيني ظاهر للقارئ:');
rows.filter((r) => r.latin.length).forEach((r) => console.log('  ' + r.href.padEnd(38) + r.latin.join(', ')));

console.log('\n— الأطول والأقصر:');
[...rows].sort((a, b) => b.words - a.words).slice(0, 4).forEach((r) => console.log('  طويلة ' + r.href.padEnd(34) + r.words + ' كلمة · ' + r.height + 'px'));
[...rows].sort((a, b) => a.words - b.words).slice(0, 4).forEach((r) => console.log('  قصيرة ' + r.href.padEnd(34) + r.words + ' كلمة · ' + r.height + 'px'));

console.log('\nأخطاء:', errs.length);
errs.slice(0, 5).forEach((e) => console.log('  ' + e));
await browser.close();
