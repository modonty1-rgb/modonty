import { chromium } from '@playwright/test';
const base = 'http://localhost:3001';
const dir = 'C:/Users/w2nad/AppData/Local/Temp/claude/c--Users-w2nad-Desktop-dreamToApp-MODONTY/5c1fdcfb-a3ee-4967-aeb5-f15dc163736b/scratchpad';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' })).newPage();
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
await page.goto(base + '/playbook/roles', { waitUntil: 'domcontentloaded', timeout: 180000 });
await page.waitForSelector('#duties', { timeout: 60000 });
await page.waitForTimeout(3000);

// الوسم يُزرع داخل العنصر نفسه، فيتحرّك معه في أي حاوية تمرير — لا في body بإحداثيات النافذة.
const found = await page.evaluate(() => {
  const style = document.createElement('style');
  style.textContent = `
    .__box{outline:3px dashed #ff5a5a;outline-offset:4px;border-radius:10px;position:relative}
    .__box.amber{outline-color:#f5b544}
    .__tag{position:absolute;top:-36px;right:0;z-index:100000;background:#ff5a5a;color:#1a0000;
           font:700 13px Tajawal,sans-serif;padding:4px 10px;border-radius:8px;max-width:420px;
           line-height:1.5;direction:rtl;white-space:nowrap;box-shadow:0 6px 20px rgba(0,0,0,.5)}
    .__tag.amber{background:#f5b544;color:#2b1c02}
    .__tag b{display:inline-block;background:#000;color:#fff;border-radius:6px;padding:0 7px;margin-inline-end:6px}
  `;
  document.head.appendChild(style);
  const out = [];
  const mark = (el, n, text, tone) => {
    if (!el) { out.push({ n, ok: false }); return; }
    el.classList.add('__box'); if (tone) el.classList.add(tone);
    const t = document.createElement('div');
    t.className = '__tag' + (tone ? ' ' + tone : '');
    t.innerHTML = `<b>${n}</b>${text}`;
    el.appendChild(t);
    el.setAttribute('data-mark', n);
    out.push({ n, ok: true });
  };
  const byHead = (txt) => [...document.querySelectorAll('#asks article')].find((e) => e.querySelector('h3')?.textContent.trim().startsWith(txt));
  const col = (txt) => [...document.querySelectorAll('#duties section[aria-label]')].find((e) => e.getAttribute('aria-label') === txt);
  const duty = (re) => [...document.querySelectorAll('#duties section[aria-label] > div > div')].find((e) => re.test(e.textContent));

  mark(document.querySelector('header .space-y-3'), '١', 'حشو: فقرتان تشرحان الصفحة بدل ما تقولان شيئاً — تُحذفان');
  mark(document.querySelector('header .flex.flex-wrap'), '٢', 'تكرار: نفس أرقام شريط اللوحة تحت — تُحذف');
  mark(document.querySelector('#journey h2'), '٣', 'عنوان جدلي «حلقتان لا خطّ واحد» — يصير «الرحلة»');
  mark(byHead('الإدارة'), '٤', 'خارج الجمهور: المدير يقرأ صفحة موظّفيه؟ — تُحذف');
  mark(byHead('الشريك'), '٥', 'قرّرت إخراج الشريك من هذه الصفحة — تُحذف');
  mark(col('الكتّاب الثلاثة'), '٦', 'يناقض قرارك: فكّهم لطارق وياسمين ومايا — يحتاج جوابك', 'amber');
  mark(col('الشريك نفسه'), '٧', 'يناقض قرارك: الشريك خارج الوصف الوظيفي — يحتاج جوابك', 'amber');
  mark(duty(/^\s*1\s*حملات مدفوعة/), '٨', 'مكرّرة: «مظلّة» للمهام ٣٣–٣٩ فأماني تُحسب مرّتين — تُحذف');
  mark(duty(/^\s*2\s*نشر أورجانك/), '٩', 'مكرّرة: «مظلّة» للمهام ٤٠–٤٧ فمريم تُحسب مرّتين — تُحذف');
  mark(duty(/off-page/), '١٠', 'لاتيني في نصّ بيعي «off-page» — يُعرَّب');
  mark(duty(/CTA/), '١١', 'لاتيني في نصّ بيعي «CTA» — يُعرَّب');
  return out;
});
console.log(found.map((f) => `${f.n}:${f.ok ? '✓' : '✗'}`).join('  '));

let i = 0;
for (const n of ['١', '٣', '٤', '٦', '٨', '١٠', '٧']) {
  const el = page.locator(`[data-mark="${n}"]`).first();
  if (!(await el.count())) continue;
  await el.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${dir}/roles-mark-${++i}.png` });
}
console.log('لقطات:', i);
await browser.close();
