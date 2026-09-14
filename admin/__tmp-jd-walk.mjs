import { chromium } from "playwright";

const slugs = ["executive", "sales", "performance-marketing", "social-media", "content-lead", "content-writer", "designer", "video-editor", "operations"];
const base = "http://localhost:3001";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });

await page.goto(base + "/login", { waitUntil: "domcontentloaded" });
await page.fill('input[type="email"], input[name="email"]', "claude-check@modonty.local");
await page.fill('input[type="password"], input[name="password"]', "Mdnty-Local-Check-2026!");
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 20000 });
console.log("login ok →", page.url());

async function walk(path) {
  const before = errors.length;
  const res = await page.goto(base + path, { waitUntil: "networkidle" });
  const words = (await page.locator("body").innerText()).split(/\s+/).filter(Boolean).length;
  const h1 = await page.locator("h1").first().innerText().catch(() => "—");
  const h2 = await page.locator("h2").allInnerTexts();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  return { path, status: res?.status(), words, h1, h2: h2.length, overflow, newErrors: errors.length - before };
}

const rows = [await walk("/playbook/job-descriptions")];
for (const s of slugs) rows.push(await walk("/playbook/job-descriptions/" + s));
rows.push(await walk("/playbook/roles"));

console.log("\ncode  words  h2  ovf  err  path / h1");
for (const r of rows) {
  console.log(
    String(r.status).padEnd(5),
    String(r.words).padEnd(6),
    String(r.h2).padEnd(3),
    (r.overflow ? "YES" : "-").padEnd(4),
    String(r.newErrors).padEnd(4),
    r.path,
    "|",
    r.h1.replace(/\n/g, " "),
  );
}

// الشريط الجانبي
await page.goto(base + "/playbook", { waitUntil: "networkidle" });
const nav = await page.locator("nav a, aside a").allInnerTexts();
console.log("\nالشريط:", [...new Set(nav.map((t) => t.trim()).filter(Boolean))].join(" · "));

if (errors.length) console.log("\nأخطاء:\n" + [...new Set(errors)].join("\n"));
else console.log("\nأخطاء: 0");

await browser.close();
