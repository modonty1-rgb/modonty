import { chromium } from '@playwright/test';
const base = 'http://localhost:3001';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1100 }, colorScheme: 'dark' })).newPage();
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'claude-check@modonty.local');
await page.fill('input[type="password"]', 'Mdnty-Local-Check-2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
await page.goto(base + '/playbook', { waitUntil: 'domcontentloaded', timeout: 180000 });
await page.waitForSelector('#system', { timeout: 60000 });
await page.waitForTimeout(2500);

const res = await page.evaluate(() => {
  const root = document.querySelector('#system');
  const nodes = [...root.querySelectorAll('.react-flow__node')].map((n) => ({
    t: n.innerText.replace(/\s+/g, ' ').slice(0, 22),
    r: n.getBoundingClientRect(),
  }));
  const hits = [];
  // كل مسار خطّ: نأخذ عيّنات على طوله ونرى أيّها يقع داخل بطاقة
  root.querySelectorAll('.react-flow__edge').forEach((e) => {
    const path = e.querySelector('path.react-flow__edge-path');
    if (!path) return;
    const len = path.getTotalLength();
    const svg = path.ownerSVGElement.getBoundingClientRect();
    const m = path.getScreenCTM();
    const inside = new Map();
    for (let i = 0; i <= 120; i++) {
      const p = path.getPointAtLength((len * i) / 120);
      const x = p.x * m.a + p.y * m.c + m.e;
      const y = p.x * m.b + p.y * m.d + m.f;
      nodes.forEach((n) => {
        const r = n.r;
        if (x > r.left + 2 && x < r.right - 2 && y > r.top + 2 && y < r.bottom - 2) {
          inside.set(n.t, (inside.get(n.t) || 0) + 1);
        }
      });
    }
    if (inside.size) hits.push({ edge: e.getAttribute('data-id') || e.className.baseVal, through: [...inside.entries()] });
    void svg;
  });
  // الوسوم: هل يتداخل وسمٌ مع بطاقة أو مع وسم آخر؟
  const labels = [...root.querySelectorAll('.react-flow__edge-textwrapper, .react-flow__edge-text')].map((l) => ({
    t: l.textContent.slice(0, 30), r: l.getBoundingClientRect(),
  }));
  const labelHits = [];
  labels.forEach((l) => {
    nodes.forEach((n) => {
      const a = l.r, b = n.r;
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 2 && oy > 2) labelHits.push({ label: l.t, node: n.t, ox: Math.round(ox), oy: Math.round(oy) });
    });
  });
  return { hits, labelHits, nodeCount: nodes.length };
});

console.log('بطاقات:', res.nodeCount);
console.log('\n— خطوط تمرّ داخل بطاقات:');
if (!res.hits.length) console.log('  لا شيء');
res.hits.forEach((h) => console.log(`  ${String(h.edge).padEnd(12)} → ${h.through.map(([t, c]) => `${t} (${c} عيّنة)`).join(' · ')}`));
console.log('\n— وسوم متداخلة مع بطاقات:');
if (!res.labelHits.length) console.log('  لا شيء');
res.labelHits.forEach((h) => console.log(`  «${h.label}» × ${h.node} — تداخل ${h.ox}×${h.oy}`));
await browser.close();
