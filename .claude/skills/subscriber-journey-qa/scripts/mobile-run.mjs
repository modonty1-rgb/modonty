// Mobile pass of the subscriber journey — a separate headless phone (iPhone 14: 390×844, touch),
// because Khalid's own Chrome must never be resized (memory: playwright-no-resize-extension) and
// the site refuses to be framed (X-Frame-Options: DENY). Every screen is photographed and audited,
// and documents/qa/subscriber-journey/mobile/index.html (refreshes every 5 s) shows them as they land.
//   node mobile-run.mjs [--only 3,4] [--base http://localhost:3000]
//   node mobile-run.mjs --set all      → every page of modonty (78 routes, real samples from the
//                                        DB), gallery in documents/qa/subscriber-journey/mobile-all/
// Audit per screen: horizontal overflow (and the elements causing it), tap targets under 44 px,
// text under 12 px. Findings are NOT written automatically — read the shots, then note.mjs add.
import { createRequire } from "module";
import fs from "fs";
import path from "path";

const root = process.cwd();
// Playwright sits in pnpm's store (a dependency of @playwright/test), not at the root.
const pwDir = fs.readdirSync(path.join(root, "node_modules", ".pnpm")).filter((d) => d.startsWith("playwright@")).sort().pop();
const req = createRequire(path.join(root, "node_modules", ".pnpm", pwDir, "node_modules", "playwright", "package.json"));
const { chromium, devices } = req("playwright");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg("base", "http://localhost:3000");
const ONLY = arg("only", "") ? new Set(arg("only").split(",").map(Number)) : null;
const SET = arg("set", "journey");
const outDir = path.join(root, "documents", "qa", "subscriber-journey", SET === "all" ? "mobile-all" : "mobile");
fs.mkdirSync(outDir, { recursive: true });
const dataFile = path.join(outDir, "shots.json");
const shots = ONLY && fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, "utf8")) : [];

const ARTICLE = "/articles/" + encodeURIComponent("التجارة-الإلكترونية-في-السعودية-كيف-يختار-العميل");
const CLIENT = "/clients/" + encodeURIComponent("شركة-جبر-سيو");
const USER = { email: "qa-sub-03@test.local", password: "Qa-Sub-2026!" };

// The article's action tabs load lazily (ssr:false) and are named «أعجبني ٧» on the phone bar.
const likeBtn = async (p) => { const b = p.getByRole("button", { name: /^أعجبني/ }).first(); await b.waitFor({ timeout: 20000 }); return b; };
const settle = async (page) => { await page.waitForLoadState("networkidle").catch(() => {}); await page.waitForTimeout(1200); };
const go = (url) => async (page) => { await page.goto(BASE + url, { waitUntil: "domcontentloaded" }); await settle(page); };
const signIn = async (page) => {
  await page.goto(BASE + "/users/login"); await settle(page);
  await page.fill("#email", USER.email); await page.fill("#password", USER.password);
  await page.click("form button[type=submit]");
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(500);
    const s = await page.evaluate(async () => (await (await fetch("/api/auth/session")).json())).catch(() => null);
    if (s?.user) return;
  }
  throw new Error("login did not complete");
};

// Each step: [name, action]. Guest steps first, then one sign-in, then the signed-in ones.
const JOURNEY = [
  ["الرئيسية — زائر", go("/")],
  ["القائمة الجانبية", async (p) => { await go("/")(p); await p.getByRole("button", { name: /القائمة|menu/i }).first().tap(); await p.waitForTimeout(700); }],
  ["المقالة — أعلى", go(ARTICLE)],
  ["المقالة — شريط التفاعل", async (p) => { await go(ARTICLE)(p); await (await likeBtn(p)).scrollIntoViewIfNeeded(); await p.waitForTimeout(500); }],
  ["أعجبني وأنا زائر → نافذة الدخول", async (p) => { await go(ARTICLE)(p); await (await likeBtn(p)).tap(); await p.getByRole("dialog").waitFor(); await p.waitForTimeout(400); }],
  ["تسجيل الدخول", go("/users/login")],
  ["كلمة مرور غلط", async (p) => { await go("/users/login")(p); await p.fill("#email", USER.email); await p.fill("#password", "wrong-pass-1"); await p.click("form button[type=submit]"); await p.locator(".bg-destructive\\/10").waitFor({ timeout: 15000 }); }],
  ["إنشاء حساب", go("/users/register")],
  ["الريلز", go("/reels")],
  ["قائمة الشركاء", go("/clients")],
  ["صفحة الشريك — زائر", go(CLIENT)],
  ["صفحة تقييمات الشريك", async (p) => { await go(CLIENT + "/reviews")(p); await p.locator('section[aria-label="اكتب تقييمك"]').scrollIntoViewIfNeeded().catch(() => {}); await p.waitForTimeout(400); }],
  ["مدونتي — صفحة الشركاء", go("/modonty")],
  ["عجلة الحظ", go("/lucky-wheel")],
  ["— دخول qa-sub-03 —", signIn],
  ["المقالة — مسجّل", async (p) => { await go(ARTICLE)(p); await (await likeBtn(p)).scrollIntoViewIfNeeded(); await p.waitForTimeout(500); }],
  ["حوار التعليق", async (p) => { await go(ARTICLE)(p); await p.getByRole("button", { name: /أضف تعليق|اكتب أول تعليق/ }).first().tap(); await p.getByRole("dialog").waitFor(); await p.waitForTimeout(400); }],
  ["صفحة الشريك — مسجّل", go(CLIENT)],
  ["البروفايل", go("/users/profile")],
  ["الإعدادات", go("/users/profile/settings")],
  ["الإشعارات", go("/users/notifications")],
];

// Every page of modonty (Khalid, 30 Sep 2026: «اعمل لي جرد… شاشات الموبايل كلها كاملة»). Dynamic
// routes take a real published sample from modonty_dev; the list mirrors `find app -name page.tsx`.
async function inventorySteps() {
  const { db } = await import(new URL("./_db.mjs", import.meta.url));
  const pick = async (model, where = {}) => (await db[model].findFirst({ where, select: { slug: true } }))?.slug;
  const [article, author, category, industry, tag, reel, client, user] = await Promise.all([
    pick("article", { status: "PUBLISHED" }), pick("author"), pick("category"), pick("industry"), pick("tag"),
    db.media.findFirst({ where: { reelSlug: { not: null }, inReels: true }, select: { reelSlug: true } }).then((m) => m?.reelSlug),
    Promise.resolve("شركة-جبر-سيو"),
    db.user.findUnique({ where: { email: USER.email }, select: { id: true } }).then((u) => u?.id),
  ]);
  await db.$disconnect();
  const e = encodeURIComponent;
  const guest = [
    ["/", "الرئيسية"], ["/page/2", "الرئيسية صفحة 2"], ["/about", "من نحن"], ["/accounts", "الحسابات"], ["/analytics", "الإحصاءات"],
    ["/articles", "المقالات"], [`/articles/${e(article)}`, "مقالة"], ["/audio", "الصوتيات"], [`/authors/${e(author)}`, "كاتب"],
    ["/booking", "الحجز"], ["/categories", "التصنيفات"], [`/categories/${e(category)}`, "تصنيف"],
    ["/clients", "الشركاء"], [`/clients/${e(client)}`, "شريك"],
    ...["about", "articles", "book", "contact", "faq", "followers", "likes", "mentions", "photos", "reels", "reviews", "services"].map((sub) => [`/clients/${e(client)}/${sub}`, `شريك — ${sub}`]),
    ["/contact", "تواصل"], ["/help", "المساعدة"], ["/help/faq", "الأسئلة الشائعة"], ["/help/feedback", "ملاحظاتك"],
    ["/industries", "الصناعات"], [`/industries/${e(industry)}`, "صناعة"],
    ["/legal", "القانونية"], ["/legal/cookie-policy", "الكوكيز"], ["/legal/copyright-policy", "حقوق النشر"], ["/legal/privacy-policy", "الخصوصية"], ["/legal/user-agreement", "اتفاقية الاستخدام"],
    ["/lucky-wheel", "عجلة الحظ"], ["/modo-chat", "مودو شات"], ["/modo-link", "مودو لينك"],
    ["/modonty", "مدونتي"], ["/modonty/ai", "مدونتي — الذكاء"], ["/modonty/education", "مدونتي — التعليم"], ["/modonty/entertainment", "مدونتي — الترفيه"],
    ["/modonty/entrepreneurship", "مدونتي — ريادة"], ["/modonty/football", "مدونتي — الكورة"], ["/modonty/health", "مدونتي — الصحة"], ["/modonty/unknown-sector", "صفحة 404"],
    ["/news", "الأخبار"], ["/news/subscribe", "اشتراك الأخبار"], ["/quran", "القرآن"], ["/reels", "الريلز"], [`/reels/${e(reel)}`, "ريل"],
    ["/search", "البحث"], ["/shop", "المتجر"], ["/story", "قصتنا"], ["/subscribe", "الاشتراك"], ["/tags", "الوسوم"], [`/tags/${e(tag)}`, "وسم"],
    ["/team", "الفريق"], ["/terms", "الشروط"], ["/trending", "الرائج"], ["/trust", "الثقة"], [`/users/${user}`, "صفحة مشترك عامة"],
    ["/users/login", "الدخول"], ["/users/register", "التسجيل"], ["/users/forgot-password", "نسيت كلمة المرور"],
    ["/users/reset-password", "إعادة التعيين (بلا رمز)"], ["/users/verify-email", "تأكيد البريد (بلا رمز)"],
  ];
  const member = [
    ["/users/profile", "البروفايل"], ["/users/profile/bookings", "حجوزاتي"], ["/users/profile/comments", "تعليقاتي"], ["/users/profile/disliked", "لم يعجبني"],
    ["/users/profile/favorites", "المحفوظات"], ["/users/profile/following", "المتابَعون"], ["/users/profile/liked", "الإعجابات"],
    ["/users/profile/settings", "الإعدادات"], ["/users/notifications", "الإشعارات"],
  ];
  return [...guest.map(([u, n]) => [n, go(u)]), [`— دخول ${USER.email} —`, signIn], ...member.map(([u, n]) => [n, go(u)])];
}
const STEPS = SET === "all" ? await inventorySteps() : JOURNEY;

async function audit(page) {
  return page.evaluate(() => {
    // A phone shrinks an overflowing page to fit, so innerWidth grows past the device width and
    // scrollWidth == innerWidth — measure against the device (screen.width), not the layout.
    const vw = window.screen.width;
    const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.05; };
    const inScroller = (el) => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === "auto" || o === "scroll" || o === "hidden" || o === "clip") return true; } return false; };
    const label = (el) => (el.getAttribute("aria-label") || el.innerText || el.getAttribute("placeholder") || el.tagName).replace(/\s+/g, " ").trim().slice(0, 40);
    const overflowPx = Math.max(document.documentElement.scrollWidth, window.innerWidth) - vw;
    const wide = [];
    if (overflowPx > 1) {
      for (const el of document.body.querySelectorAll("*")) {
        if (!visible(el) || inScroller(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 || r.left < -1) wide.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0] || ""} [${Math.round(r.left)}→${Math.round(r.right)}] ${label(el)}`);
        if (wide.length >= 6) break;
      }
    }
    const taps = [...document.querySelectorAll("a[href], button, [role=button], input:not([type=hidden]), select, textarea")].filter(visible).filter((el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight * 3; })
      // A link inside a sentence is exempt from target size (WCAG 2.5.8 «inline» exception).
      .filter((el) => !(el.tagName === "A" && el.closest("p")))
      // Breadcrumbs are secondary navigation: WCAG 2.5.8 asks 24px there, not 44 (page-frame.tsx).
      .filter((el) => !(el.closest("nav[aria-label='مسار الصفحة']") && el.getBoundingClientRect().height >= 24))
      // The skip link is 1×1 until focused — by design.
      .filter((el) => !el.matches("a[href^='#main'], a[href='#main-content']"));
    // A control inside a <label> is tapped through the whole label — measure that instead.
    // And a link stretched over its card by an absolute ::after is tapped through the whole card.
    const hit = (el) => {
      const l = el.closest("label") ?? (el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null);
      if (l && l !== el) {
        // The control and its label are one target: tapping either toggles it.
        const a = el.getBoundingClientRect(), c = l.getBoundingClientRect();
        return { width: Math.max(a.right, c.right) - Math.min(a.left, c.left), height: Math.max(a.bottom, c.bottom) - Math.min(a.top, c.top) };
      }
      // An absolute ::before/::after on a positioned control is its hit area (after:size-11,
      // before:-inset-1.5 …) — take the larger of the two and the box itself.
      if (getComputedStyle(el).position !== "static") {
        const r = el.getBoundingClientRect();
        let w = r.width, h = r.height;
        for (const pseudo of ["::before", "::after"]) {
          const ps = getComputedStyle(el, pseudo);
          if (ps.position === "absolute" && ps.content !== "none") { w = Math.max(w, parseFloat(ps.width) || 0); h = Math.max(h, parseFloat(ps.height) || 0); }
        }
        if (w > r.width || h > r.height) return { width: w, height: h };
      }
      const after = getComputedStyle(el, "::after");
      if (after.position === "absolute") {
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).position !== "static") return a.getBoundingClientRect();
      }
      return el.getBoundingClientRect();
    };
    const small = taps.map((el) => ({ el, r: hit(el) })).filter(({ r }) => r.height < 44 || r.width < 44);
    const tiny = small.filter(({ r }) => r.height < 32 || r.width < 24).map(({ el, r }) => `${Math.round(r.width)}×${Math.round(r.height)} ${label(el)}`);
    const near = small.filter(({ r }) => !(r.height < 32 || r.width < 24)).map(({ el, r }) => `${Math.round(r.width)}×${Math.round(r.height)} ${label(el)}`);
    const smallText = [];
    for (const el of document.body.querySelectorAll("p, span, a, button, li, small, label, div")) {
      if (!visible(el) || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 12) smallText.push(`${fs}px ${el.innerText.replace(/\s+/g, " ").trim().slice(0, 30)}`);
      if (smallText.length >= 6) break;
    }
    return { vw, overflowPx: Math.max(0, overflowPx), wide, tapsChecked: taps.length, under44: small.length, tiny: tiny.slice(0, 8), near: near.slice(0, 12), smallText };
  });
}

// Auto-refresh only while a run is going — a finished gallery reloading every 5 s just confused
// the reader (Khalid, 29 Sep 2026: «كل شويه بيعمل ريفرش ايه الموضوع»).
let running = true;
function render() {
  fs.writeFileSync(dataFile, JSON.stringify(shots, null, 2));
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const card = (s) => `<figure class="${s.error ? "err" : s.audit?.overflowPx ? "warn" : ""}"><figcaption><b>${s.n}. ${esc(s.name)}</b><small>${esc(s.url)}</small></figcaption>
${s.file ? `<a href="${s.file}?v=${s.at}" target="_blank"><img src="${s.file}?v=${s.at}" loading="lazy"></a>` : ""}
${s.error ? `<p class="e">خطأ: ${esc(s.error)}</p>` : ""}
${s.audit ? `<ul>${s.audit.overflowPx ? `<li class="bad">مشكلة: الصفحة أعرض من الشاشة بـ${s.audit.overflowPx}px</li>` : `<li class="ok">سليم: الصفحة بعرض الشاشة</li>`}${s.audit.wide.map((w) => `<li class="bad" dir="ltr">${esc(w)}</li>`).join("")}${s.audit.tiny.length ? s.audit.tiny.map((w) => `<li class="bad">مشكلة: زر صغير جداً للإصبع — ${esc(w)}</li>`).join("") : `<li class="ok">سليم: الأزرار بحجم الإصبع</li>`}${s.audit.near?.length ? `<li class="note">ملاحظة: ${s.audit.near.length} زر أقل من 44px (فوق الحد الأدنى) — ${esc(s.audit.near.slice(0, 2).join(" · "))}</li>` : ""}${s.audit.smallText.length ? `<li class="note">ملاحظة تصميم (مو عطل): ${s.audit.smallText.length} نص أصغر من 12px — ${esc(s.audit.smallText.slice(0, 2).join(" · "))}</li>` : ""}</ul>` : ""}</figure>`;
  fs.writeFileSync(path.join(outDir, "index.html"), `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">${running ? '<meta http-equiv="refresh" content="5">' : ""}<title>فحص الجوّال</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet"><style>
:root{--bg:#f5f6fb;--card:#fff;--ink:#22243d;--mut:#686a80;--line:#e2e4ef;--bad:#b42318;--warn:#b54708;--ok:#067647}
@media (prefers-color-scheme:dark){:root{--bg:#0f1024;--card:#181a33;--ink:#e6e7f2;--mut:#a3a5bb;--line:#2e3150;--bad:#f97066;--warn:#fdb022;--ok:#47cd89}}
body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.7 Tajawal,Tahoma,sans-serif}main{padding:20px 16px;max-width:1500px;margin:auto}
h1{margin:0 0 4px;font-size:22px}.sub{color:var(--mut);margin:0 0 18px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px}figure.warn{border-color:var(--warn)}figure.err{border-color:var(--bad)}
figcaption{display:flex;flex-direction:column;margin-bottom:6px}small{color:var(--mut);direction:ltr;text-align:right;font-size:11px;word-break:break-all}
img{width:100%;border-radius:10px;border:1px solid var(--line);max-height:560px;object-fit:cover;object-position:top}
ul{margin:6px 0 0;padding:0 16px 0 0;font-size:12px}.bad{color:var(--bad);font-weight:700}.ok{color:var(--ok)}.note{color:var(--mut)}.e{color:var(--bad)}
.legend{display:flex;gap:16px;flex-wrap:wrap;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin-bottom:16px;font-size:13px}
</style></head><body><main><h1>${SET === "all" ? "جرد كل شاشات مدونتي على الجوّال" : "فحص الجوّال"} — iPhone 14 (390×844)</h1><p class="sub">متصفّح جوّال منفصل · ${running ? "الفحص شغّال — تتحدّث كل ٥ ثوانٍ" : "انتهى الفحص"} · ${shots.length} شاشة · اضغط الصورة لتكبيرها</p>
<div class="legend"><span class="ok">● أخضر = سليم</span><span class="bad">● أحمر = مشكلة لازم تتصلّح</span><span class="note">● رمادي = ملاحظة تصميم، مو عطل</span></div>
<div class="grid">${shots.map(card).join("")}</div></main></body></html>`);
}

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices["iPhone 14"], locale: "ar-SA", colorScheme: "light" });
// Next's dev badge (the black «N») is not part of the site — hide it so the shots double as
// clean assets (Khalid wants them for a Remotion animation, 29 Sep 2026).
await context.addInitScript(() => {
  const css = "nextjs-portal{display:none!important}";
  const add = () => { const st = document.createElement("style"); st.textContent = css; document.documentElement.appendChild(st); };
  if (document.documentElement) add(); else document.addEventListener("DOMContentLoaded", add);
});
const page = await context.newPage();
render();
for (let i = 0; i < STEPS.length; i++) {
  const n = i + 1;
  const [name, action] = STEPS[i];
  if (ONLY && !ONLY.has(n) && !name.startsWith("—")) continue;
  const rec = { n, name, url: "", at: Date.now() };
  try {
    await action(page);
    rec.url = decodeURIComponent(page.url().replace(BASE, ""));
    if (!name.startsWith("—")) {
      rec.audit = await audit(page);
      rec.file = `${String(n).padStart(2, "0")}.png`;
      await page.screenshot({ path: path.join(outDir, rec.file), fullPage: false });
      // The whole page too — for scroll animations. Skipped when a dialog is open (it would stretch).
      if (!(await page.getByRole("dialog").count())) {
        rec.full = `${String(n).padStart(2, "0")}-full.png`;
        await page.screenshot({ path: path.join(outDir, rec.full), fullPage: true }).catch(() => { delete rec.full; });
      }
    }
  } catch (e) {
    rec.error = String(e.message || e).split("\n")[0].slice(0, 200);
    rec.url = decodeURIComponent(page.url().replace(BASE, ""));
    rec.file = `${String(n).padStart(2, "0")}.png`;
    await page.screenshot({ path: path.join(outDir, rec.file) }).catch(() => { delete rec.file; });
  }
  const at = shots.findIndex((s) => s.n === n);
  if (at > -1) shots[at] = rec; else shots.push(rec);
  shots.sort((a, b) => a.n - b.n);
  render();
  console.log(`${n}. ${name} ${rec.error ? "✗ " + rec.error : `overflow=${rec.audit?.overflowPx ?? "-"} under44=${rec.audit?.under44 ?? "-"} tiny=${rec.audit?.tiny.length ?? "-"}`}`);
}
await browser.close();
running = false;
render();
