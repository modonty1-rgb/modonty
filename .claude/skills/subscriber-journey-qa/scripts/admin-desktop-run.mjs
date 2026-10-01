// Every admin page, visible and hidden, on the desktop (Khalid, 1 Oct 2026: «جرد كامل لصفحات الادمن
// كامله الصفحات الظاهره والصفحات المخفيه» — list + desktop shots). Same output shape as the console
// run: a shot per page, shots.json and an index.html in documents/qa/admin-desktop/.
//   node .claude/skills/subscriber-journey-qa/scripts/admin-desktop-run.mjs [--base http://localhost:3001] [--only clients]
// The inventory is read from the code, not typed: routes = every admin/app/**/page.tsx; «visible» = its
// href is written in a menu (sidebar · sales · campaigns · tasks · header); «linked» = another admin
// file links to it; guard = the access check in the page or a layout above it. Signed in as the dev
// ADMIN check account (memory: admin-local-check-account); modonty_dev only (_db.mjs stops otherwise).
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { db, DB_NAME } from "./_db.mjs";

const root = process.cwd();
const pwDir = fs.readdirSync(path.join(root, "node_modules", ".pnpm")).filter((d) => d.startsWith("playwright@")).sort().pop();
const req = createRequire(path.join(root, "node_modules", ".pnpm", pwDir, "node_modules", "playwright", "package.json"));
const { chromium } = req("playwright");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg("base", "http://localhost:3001");
const ONLY = arg("only", "");
const DAY = new Date().toISOString().slice(0, 10);
const ADMIN = path.join(root, "admin");
const APP = path.join(ADMIN, "app");
const outDir = path.join(root, "documents", "qa", "admin-desktop");
fs.mkdirSync(outDir, { recursive: true });
const LOGIN = { email: "claude-check@modonty.local", password: "Mdnty-Local-Check-2026!" };

// ── 1. Routes ────────────────────────────────────────────────────────────────
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) return e.name === "api" && dir === APP ? [] : walk(p);
  return [p];
});
const files = walk(APP);
const routes = files
  .filter((f) => path.basename(f) === "page.tsx")
  .map((f) => {
    const rel = path.relative(APP, path.dirname(f)).split(path.sep).filter(Boolean);
    const group = rel.find((s) => /^\(.+\)$/.test(s)) ?? "";
    const segs = rel.filter((s) => !/^\(.+\)$/.test(s));
    return { file: path.relative(root, f).replaceAll("\\", "/"), group, pattern: "/" + segs.join("/"), dynamic: segs.some((s) => s.startsWith("[")) };
  })
  .sort((a, b) => a.pattern.localeCompare(b.pattern));

// ── 2. Menus — where each href is written ───────────────────────────────────
const read = (p) => fs.readFileSync(path.join(ADMIN, p), "utf8");
const MENUS = [
  ["components/admin/sidebar.tsx", "القائمة الجانبية"],
  ["components/admin/sales-menu.tsx", "قائمة المبيعات (فوق)"],
  ["components/admin/campaigns-menu.tsx", "قائمة الحملات (فوق)"],
  ["components/admin/tasks-menu.tsx", "قائمة المهام (فوق)"],
  ["components/admin/header.tsx", "الهيدر"],
];
const menuOf = new Map(); // href → { where, note }
for (const [file, label] of MENUS) {
  let group = "";
  let sub = "";
  for (const line of read(file).split("\n")) {
    const t = line.match(/^\s{4}title:\s*"([^"]+)"/);
    if (t) { group = t[1]; sub = ""; }
    const s = line.match(/subMenu:\s*"([^"]+)"/);
    if (s) sub = s[1];
    for (const m of line.matchAll(/href[:=]\s*["'`]([^"'`$]+)["'`]/g)) {
      const href = m[1];
      if (!href.startsWith("/") || menuOf.has(href)) continue;
      const where = file.includes("sidebar") && group ? `${label} › ${group}${sub ? ` › ${sub}` : ""}` : label;
      const note = /adminOnly:\s*true/.test(line) ? "للأدمن فقط" : /flag:/.test(line) ? "يظهر حين يُفتح الترحيل" : "";
      menuOf.set(href, { where, note });
    }
  }
}
// Conditions written outside the item line (tasks-menu.tsx:75 · sidebar: the dashboard row and the sectors).
for (const h of ["/daily-tasks", "/tasks/assign"]) if (menuOf.has(h)) menuOf.get(h).note = "لمن عنده صلاحية التقارير";
if (!menuOf.has("/")) menuOf.set("/", { where: "القائمة الجانبية", note: "" });
const sectorSlugs = [...fs.readFileSync(path.join(root, "shared", "lib", "sectors", "live-sectors.ts"), "utf8").matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

// ── 3. Links from inside other pages ────────────────────────────────────────
const MENU_FILES = new Set(MENUS.map(([f]) => path.join(ADMIN, f)));
const sources = [...files, ...walk(path.join(ADMIN, "components")), ...walk(path.join(ADMIN, "lib"))]
  .filter((f) => /\.(tsx?|ts)$/.test(f) && !MENU_FILES.has(f))
  .map((f) => ({ f, text: fs.readFileSync(f, "utf8") }));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function linkedFrom(r) {
  // Static: the exact path in a string, followed by a quote, ? or #. Dynamic: the part before the
  // first [param] written as a template (`/clients/${…`).
  const staticPart = r.pattern.split("/[")[0];
  const re = r.dynamic
    ? new RegExp(`["'\`]${esc(staticPart)}/\\$\\{`)
    : new RegExp(`["'\`]${esc(r.pattern)}(?=["'\`?#])`);
  const own = path.join(root, r.file);
  return sources.filter((s) => s.f !== own && re.test(s.text)).map((s) => path.relative(ADMIN, s.f).replaceAll("\\", "/"));
}

// ── 4. Guard — the access check in the page or a layout above it ───────────
function guardOf(r) {
  if (r.group === "(auth)") return "عامّة — بلا دخول";
  const dirs = [];
  let d = path.dirname(path.join(root, r.file));
  while (d.startsWith(APP)) { dirs.push(d); d = path.dirname(d); }
  const own = fs.readFileSync(path.join(root, r.file), "utf8");
  const layouts = dirs.map((x) => path.join(x, "layout.tsx")).filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, "utf8")).join("\n");
  const text = own + "\n" + layouts;
  if (r.pattern.startsWith("/daily-tasks")) return "صلاحية التقارير (proxy.ts)";
  if (/requireFinanceAdmin|checkFinanceAdmin/.test(text)) return "أدمن فقط";
  if (/requireSalesDesk|checkSalesDesk/.test(text)) return "أدمن + مبيعات";
  if (/role\s*[!=]==\s*["']ADMIN["']/.test(own)) return "فيها شرط أدمن";
  if (/canSeeReports|canViewReports/.test(own)) return "صلاحية التقارير";
  return "كل الموظفين";
}

// ── 5. A real sample for each [param] ───────────────────────────────────────
const one = async (q) => (await q.catch(() => null))?.id ?? null;
const S = {
  article: await one(db.article.findFirst({ where: { status: "PUBLISHED" }, orderBy: { datePublished: "desc" }, select: { id: true } })),
  client: await one(db.client.findFirst({ where: { slug: "شركة-جبر-سيو" }, select: { id: true } })) ?? (await one(db.client.findFirst({ select: { id: true } }))),
  order: await one(db.checkoutOrder.findFirst({ where: { status: "PAID" }, orderBy: { createdAt: "desc" }, select: { id: true } })),
  category: await one(db.category.findFirst({ select: { id: true } })),
  tag: await one(db.tag.findFirst({ select: { id: true } })),
  industry: await one(db.industry.findFirst({ select: { id: true } })),
  plan: await one(db.commercialPlan.findFirst({ select: { id: true } })),
  message: await one(db.contactMessage.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true } })),
  media: await one(db.media.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true } })),
  faq: await one(db.fAQ.findFirst({ select: { id: true } })),
  lead: await one(db.salesLead.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true } })),
  campaign: await one(db.adCampaign.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true } })),
  staff: await one(db.staff.findFirst({ where: { email: LOGIN.email }, select: { id: true } })),
};
await db.$disconnect();
// [route pattern prefix → value] — first match wins; segment keys and slugs are the ones the
// dashboard itself links to.
const FILL = [
  ["/articles/segment/[key]", "published"],
  ["/clients/segment/[key]", "active"],
  ["/media/segment/[key]", "unused"],
  ["/reference/segment/[key]", "categories"],
  ["/articles/workflow/[transition]", "writing-to-draft"],
  ["/campaigns/reports/[brand]", "modonty"],
  ["/modonty/pages/[slug]", "about"],
  ["/modonty/sectors/[sector]", sectorSlugs[0] ?? "football"],
  ["/clients/activate/[orderId]", S.order],
  ["/articles/", S.article],
  ["/clients/", S.client],
  ["/briefs/", S.client], ["/client-articles/", S.client], ["/client-galleries/", S.client], ["/inbox/", S.client], ["/seo-images/", S.client],
  ["/orders/", S.order], ["/categories/", S.category], ["/tags/", S.tag], ["/industries/", S.industry],
  ["/commercial-plans/", S.plan], ["/contact-messages/", S.message], ["/media/", S.media], ["/modonty/faq/", S.faq],
  ["/sales-leads/", S.lead], ["/campaigns/", S.campaign], ["/users/", S.staff],
];
function sampleUrl(r) {
  if (!r.dynamic) return r.pattern;
  const hit = FILL.find(([p]) => r.pattern.startsWith(p) || r.pattern === p);
  if (!hit || !hit[1]) return null;
  return r.pattern.replace(/\[[^\]]+\]/, encodeURIComponent(hit[1]));
}

// ── 6. Shoot ────────────────────────────────────────────────────────────────
const settle = async (page) => {
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  for (let i = 0; i < 20; i++) {
    const busy = await page.locator(".animate-pulse, [aria-busy=true]").count().catch(() => 0);
    if (!busy) break;
    await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(800);
};
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "ar-SA", colorScheme: "light" });
await context.addInitScript(() => {
  const hide = () => {
    if (document.getElementById("__qa_hide")) return;
    const st = document.createElement("style");
    st.id = "__qa_hide";
    st.textContent = "nextjs-portal{display:none!important}";
    document.documentElement.appendChild(st);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hide);
  else hide();
});
const page = await context.newPage();

const authRoutes = routes.filter((r) => r.group === "(auth)");
const staffRoutes = routes.filter((r) => r.group !== "(auth)");
const shots = [];
let n = 0;
async function shoot(r) {
  n += 1;
  const url = sampleUrl(r);
  const menu = r.pattern.startsWith("/modonty/sectors/") ? { where: "القائمة الجانبية › Modonty › القطاعات", note: "" } : r.pattern.startsWith("/modonty/pages/") ? { where: "القائمة الجانبية › Modonty › Pages", note: "" } : menuOf.get(r.pattern);
  const links = menu ? [] : linkedFrom(r);
  const rec = {
    n, pattern: r.pattern, url, file: r.file, dynamic: r.dynamic, guard: guardOf(r),
    visibility: menu ? "ظاهرة" : links.length ? "مخفية — لها رابط داخلي" : "مخفية — بلا أي رابط",
    menu: menu?.where ?? null, menuNote: menu?.note || null, linkedFrom: links.slice(0, 4), linkedCount: links.length,
  };
  if (ONLY && !r.pattern.includes(ONLY)) return;
  if (!url) { rec.error = "لا عيّنة في قاعدة dev لهذا المسار"; shots.push(rec); console.log(String(n).padStart(3, "0"), "SKIP", r.pattern); return; }
  const base = `${String(n).padStart(3, "0")}-${r.pattern.replace(/[\/\[\]]+/g, "-").replace(/^-|-$/g, "") || "home"}`;
  try {
    const t0 = Date.now();
    const res = await page.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 180000 });
    await settle(page);
    rec.ms = Date.now() - t0;
    rec.status = res?.status() ?? null;
    rec.finalUrl = decodeURIComponent(page.url().replace(BASE, ""));
    rec.title = (await page.locator("main h1, h1").first().textContent({ timeout: 2000 }).catch(() => null))?.trim().replace(/\s+/g, " ").slice(0, 80) || (await page.title());
    rec.notFound = await page.locator("text=/404|This page could not be found|الصفحة غير موجودة/").count().catch(() => 0) > 0;
    rec.shot = `${base}.png`;
    await page.screenshot({ path: path.join(outDir, rec.shot) });
    rec.full = `${base}-full.jpg`;
    await page.screenshot({ path: path.join(outDir, rec.full), fullPage: true, type: "jpeg", quality: 60 }).catch(() => { delete rec.full; });
  } catch (e) {
    rec.error = String(e).split("\n")[0].slice(0, 200);
  }
  shots.push(rec);
  console.log(String(n).padStart(3, "0"), rec.status ?? "ERR", `${rec.ms ?? "-"}ms`, url, rec.finalUrl && rec.finalUrl !== decodeURIComponent(url) ? `→ ${rec.finalUrl}` : "", rec.visibility, rec.error ?? "");
}

for (const r of authRoutes) await shoot(r);
await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
await settle(page);
await page.fill("#email", LOGIN.email);
await page.fill("#password", LOGIN.password);
await page.locator("form button[type=submit]").click();
await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 60000 });
for (const r of staffRoutes) await shoot(r);
await browser.close();

// ── 7. Gallery ──────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(outDir, "shots.json"), JSON.stringify({ day: DAY, db: DB_NAME, base: BASE, total: routes.length, shots }, null, 2));
const h = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const count = (f) => shots.filter(f).length;
const broken = (s) => s.error || (s.status && s.status >= 400) || s.notFound;
const sections = [...new Set(shots.map((s) => s.pattern.split("/")[1] || "/"))];
const card = (s) => `<figure class="${broken(s) ? "bad" : ""}">
  ${s.shot ? `<a href="${s.full ?? s.shot}" target="_blank"><img loading="lazy" src="${s.shot}" alt=""></a>` : `<div class="noshot">بلا صورة</div>`}
  <figcaption><b>${h(s.title || s.pattern)}</b>
  <small dir="ltr">${h(s.url ?? s.pattern)}</small>
  <span class="tag ${s.visibility.startsWith("ظاهرة") ? "vis" : s.linkedCount ? "lnk" : "orph"}">${h(s.visibility)}</span>
  ${s.menu ? `<span class="meta">${h(s.menu)}${s.menuNote ? ` · ${h(s.menuNote)}` : ""}</span>` : s.linkedFrom.length ? `<span class="meta">يُفتح من: <span dir="ltr">${h(s.linkedFrom.join(" · "))}</span>${s.linkedCount > 4 ? ` +${s.linkedCount - 4}` : ""}</span>` : ""}
  <span class="meta">الدخول: ${h(s.guard)}${s.status ? ` · HTTP ${s.status}` : ""}${s.ms ? ` · ${(s.ms / 1000).toFixed(1)}ث` : ""}</span>
  ${s.finalUrl && s.url && s.finalUrl !== decodeURIComponent(s.url) ? `<span class="meta warn">حوّلت إلى <span dir="ltr">${h(s.finalUrl)}</span></span>` : ""}
  ${s.error ? `<span class="meta warn">${h(s.error)}</span>` : s.notFound ? `<span class="meta warn">الصفحة تعرض «غير موجودة»</span>` : ""}
  </figcaption></figure>`;
fs.writeFileSync(
  path.join(outDir, "index.html"),
  `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>جرد صفحات الأدمن</title>
<style>body{font-family:Tajawal,system-ui,sans-serif;margin:24px;background:#f6f6f7;color:#111}h1{font-size:22px;margin:0 0 6px}h2{font-size:16px;margin:28px 0 10px;border-bottom:1px solid #ddd;padding-bottom:6px}
.sum{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0 4px}.sum div{background:#fff;border:1px solid #e3e3e6;border-radius:10px;padding:8px 12px;font-size:13px}.sum b{font-size:18px;display:block}
.filters{margin:12px 0;display:flex;gap:8px;flex-wrap:wrap}.filters button{font:inherit;font-size:13px;border:1px solid #ccc;background:#fff;border-radius:999px;padding:4px 12px;cursor:pointer}.filters button.on{background:#111;color:#fff;border-color:#111}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
figure{margin:0;background:#fff;border:1px solid #e3e3e6;border-radius:12px;padding:10px}figure.bad{border-color:#d33;box-shadow:0 0 0 1px #d33}
img{width:100%;border-radius:8px;border:1px solid #eee;display:block}.noshot{height:120px;display:grid;place-items:center;background:#fafafa;border-radius:8px;color:#999;font-size:13px}
figcaption{font-size:13px;margin-top:8px;display:flex;flex-direction:column;gap:4px}small{color:#666;text-align:right}
.tag{align-self:flex-start;border-radius:999px;padding:1px 9px;font-size:12px;font-weight:700}.vis{background:#e7f6ee;color:#11733f}.lnk{background:#fff4e0;color:#8a5300}.orph{background:#fde8e8;color:#b00}
.meta{color:#444;font-size:12px}.warn{color:#b00;font-weight:700}</style></head><body>
<h1>جرد صفحات الأدمن — ${routes.length} صفحة · ديسكتوب 1280×800 · ${DAY}</h1>
<div class="meta">مقروء من الكود: كل <span dir="ltr">admin/app/**/page.tsx</span>. «ظاهرة» = رابطها مكتوب في قائمة · «مخفية — لها رابط داخلي» = تُفتح من صفحة أخرى فقط · «بلا أي رابط» = لا يصلها أحد إلا بكتابة الرابط. الدخول بحساب أدمن على <span dir="ltr">${DB_NAME}</span>.</div>
<div class="sum">
<div><b>${routes.length}</b>كل الصفحات</div>
<div><b>${count((s) => s.visibility === "ظاهرة")}</b>ظاهرة في القوائم</div>
<div><b>${count((s) => s.visibility.includes("لها رابط"))}</b>مخفية — لها رابط داخلي</div>
<div><b>${count((s) => s.visibility.includes("بلا أي"))}</b>مخفية — بلا أي رابط</div>
<div><b>${count((s) => s.dynamic)}</b>صفحات تفاصيل (مسار متغيّر)</div>
<div><b style="color:#b00">${count(broken)}</b>لا تفتح / خطأ</div>
</div>
<div class="filters" id="f"><button class="on" data-k="">الكل</button><button data-k="vis">ظاهرة</button><button data-k="lnk">مخفية — لها رابط</button><button data-k="orph">بلا أي رابط</button><button data-k="bad">لا تفتح</button></div>
${sections.map((sec) => `<h2 dir="ltr" style="text-align:right">/${h(sec === "/" ? "" : sec)} <span class="meta">(${shots.filter((s) => (s.pattern.split("/")[1] || "/") === sec).length})</span></h2><div class="grid">${shots.filter((s) => (s.pattern.split("/")[1] || "/") === sec).map(card).join("")}</div>`).join("")}
<script>document.getElementById("f").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;document.querySelectorAll("#f button").forEach(x=>x.classList.toggle("on",x===b));const k=b.dataset.k;document.querySelectorAll("figure").forEach(f=>{f.style.display=!k||(k==="bad"?f.classList.contains("bad"):f.querySelector(".tag."+k))?"":"none"});document.querySelectorAll(".grid").forEach(g=>{const any=[...g.children].some(c=>c.style.display!=="none");g.style.display=any?"":"none";g.previousElementSibling.style.display=any?"":"none"})});</script>
</body></html>`,
);
console.log(`done → ${path.relative(root, outDir)} · ${shots.length} pages · visible ${count((s) => s.visibility === "ظاهرة")} · hidden-linked ${count((s) => s.visibility.includes("لها رابط"))} · orphan ${count((s) => s.visibility.includes("بلا أي"))} · broken ${count(broken)}`);
