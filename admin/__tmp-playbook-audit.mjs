import { chromium } from '@playwright/test';
const base = 'http://localhost:3001';
const dir = 'C:/Users/w2nad/AppData/Local/Temp/claude/c--Users-w2nad-Desktop-dreamToApp-MODONTY/5c1fdcfb-a3ee-4967-aeb5-f15dc163736b/scratchpad';
const widths = [1440, 1280, 1024, 820, 420];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 140)));
page.on('console', (m) => { if (m.type() === 'error') errs.push('console ' + m.text().slice(0, 140)); });

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
const r = await page.goto(base + '/playbook', { waitUntil: 'domcontentloaded', timeout: 180000 });
await page.waitForSelector('#surfaces', { timeout: 60000 });
await page.waitForTimeout(2500);
console.log('status', r?.status());

for (const w of widths) {
  await page.setViewportSize({ width: w, height: 1000 });
  await page.waitForTimeout(1600);

  const m = await page.evaluate(() => {
    const doc = document.documentElement;
    const out = { overflow: doc.scrollWidth - doc.clientWidth, sections: [] };
    document.querySelectorAll('section[id]').forEach((s) => {
      const r = s.getBoundingClientRect();
      out.sections.push({ id: s.id, h: Math.round(r.height), w: Math.round(r.width) });
    });
    // كل رسم React Flow: هل خرج محتواه عن حاويته؟
    out.flows = [...document.querySelectorAll('[data-testid="rf__wrapper"]')].map((wr) => {
      const box = wr.getBoundingClientRect();
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      wr.querySelectorAll('.react-flow__node, .react-flow__edge-path, .react-flow__edge-textwrapper, .react-flow__edge-textbg').forEach((el) => {
        const b = el.getBoundingClientRect();
        if (!b.width && !b.height) return;
        minX = Math.min(minX, b.left); maxX = Math.max(maxX, b.right);
        minY = Math.min(minY, b.top);  maxY = Math.max(maxY, b.bottom);
      });
      return {
        id: wr.closest('section')?.id ?? '?',
        clipLeft: Math.round(box.left - minX),
        clipRight: Math.round(maxX - box.right),
        clipTop: Math.round(box.top - minY),
        clipBottom: Math.round(maxY - box.bottom),
        slackLeft: Math.round(minX - box.left),
        slackRight: Math.round(box.right - maxX),
        boxH: Math.round(box.height),
        contentH: Math.round(maxY - minY),
      };
    });
    return out;
  });

  console.log(`\n=== ${w}px | تجاوز أفقي: ${m.overflow}`);
  m.flows.forEach((f) => {
    const clipped = Math.max(f.clipLeft, f.clipRight, f.clipTop, f.clipBottom) > 1;
    console.log(
      `  ${f.id.padEnd(10)} ${clipped ? 'مقصوص!' : 'سليم  '}` +
      ` قصّ[ي:${f.clipLeft} س:${f.clipRight} ف:${f.clipTop} ت:${f.clipBottom}]` +
      ` فراغ[ي:${f.slackLeft} س:${f.slackRight}]` +
      ` ارتفاع ${f.contentH}/${f.boxH}`
    );
  });
  await page.locator('#surfaces').screenshot({ path: `${dir}/audit-system-${w}.png` });
}

console.log('\nأخطاء:', errs.length);
errs.slice(0, 6).forEach((e) => console.log('  ' + e));
await browser.close();
