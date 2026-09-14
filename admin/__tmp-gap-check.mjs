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

const info = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll('#system .react-flow__node')].map((n) => {
    const b = n.getBoundingClientRect();
    return { x: Math.round(b.left), y: Math.round(b.top), h: Math.round(b.height), bottom: Math.round(b.bottom), t: n.innerText.replace(/\s+/g, ' ').slice(0, 26) };
  });
  const cols = {};
  nodes.forEach((n) => { (cols[n.x] ||= []).push(n); });
  const out = [];
  Object.entries(cols).forEach(([x, list]) => {
    list.sort((a, b) => a.y - b.y);
    for (let i = 1; i < list.length; i++) out.push({ col: x, gap: list[i].y - list[i - 1].bottom, h: list[i].h, t: list[i].t });
  });
  return { heights: [...new Set(nodes.map((n) => n.h))].sort((a, b) => a - b), gaps: out };
});
console.log('ارتفاعات البطاقات:', info.heights.join(' · '));
info.gaps.forEach((g) => console.log(`  عمود ${String(g.col).padStart(4)} | فجوة ${String(g.gap).padStart(3)} | ارتفاع ${g.h} | ${g.t}`));
await page.locator('#system').screenshot({ path: 'C:/Users/w2nad/AppData/Local/Temp/claude/c--Users-w2nad-Desktop-dreamToApp-MODONTY/5c1fdcfb-a3ee-4967-aeb5-f15dc163736b/scratchpad/gap.png' });
await browser.close();
