import { chromium } from '@playwright/test';
const base = 'http://localhost:3001';
const dir = 'C:/Users/w2nad/AppData/Local/Temp/claude/c--Users-w2nad-Desktop-dreamToApp-MODONTY/5c1fdcfb-a3ee-4967-aeb5-f15dc163736b/scratchpad';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 160)));
page.on('console', (m) => { if (m.type() === 'error') errs.push('console ' + m.text().slice(0, 160)); });
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
const r = await page.goto(base + '/playbook/roles', { waitUntil: 'domcontentloaded', timeout: 180000 });
await page.waitForSelector('#duties', { timeout: 60000 });
await page.waitForTimeout(3000);

const m = await page.evaluate(() => {
  const main = document.querySelector('main') || document.body;
  const secs = [...document.querySelectorAll('header, section[id]')].map((s) => {
    const r = s.getBoundingClientRect();
    return { id: s.id || s.tagName.toLowerCase(), top: Math.round(r.top + scrollY), h: Math.round(r.height), words: s.innerText.trim().split(/\s+/).length };
  });
  const latin = (main.innerText.match(/[A-Za-z]{2,}/g) || []);
  const h2s = [...document.querySelectorAll('h2')].map((h) => h.innerText.trim());
  return { pageH: document.documentElement.scrollHeight, secs, h2s, latin: [...new Set(latin)], words: main.innerText.trim().split(/\s+/).length };
});
console.log('status', r?.status(), '| ارتفاع الصفحة', m.pageH, '| كلمات', m.words);
console.log('h2:', m.h2s.join(' · '));
m.secs.forEach((s) => console.log(`  ${s.id.padEnd(12)} أعلى ${String(s.top).padStart(5)} · ارتفاع ${String(s.h).padStart(4)} · كلمات ${s.words}`));
console.log('لاتيني في النصّ:', m.latin.length ? m.latin.join(', ') : 'لا شيء');
await page.screenshot({ path: `${dir}/roles-full.png`, fullPage: true });
console.log('أخطاء:', errs.length);
errs.slice(0, 5).forEach((e) => console.log('  ' + e));
await browser.close();
