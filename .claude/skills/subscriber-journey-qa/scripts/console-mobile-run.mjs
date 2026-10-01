// Every console screen on a phone, for Remotion (Khalid, 30 Sep 2026: «نفس السكرين… للكونسل…
// نسلمها ريموشن»). Same device and output shape as the modonty run (mobile-run.mjs --set all):
// iPhone 14 · 390 CSS px · DPR 3, a viewport shot and a full-page shot per screen, a manifest.json
// and an index.html gallery. Signed in as a dev client; modonty_dev only.
//   node .claude/skills/subscriber-journey-qa/scripts/console-mobile-run.mjs [--base http://localhost:3002]
//   … --qa   → the same screens AUDITED (overflow · tap targets · small text, _mobile-audit.mjs, the
//              rules the modonty run uses) plus the open side menu; gallery with the findings in
//              documents/qa/console-mobile/ (Khalid, 30 Sep 2026: «نفس التست… ما في أي أوفرفلو»).
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { audit } from "./_mobile-audit.mjs";

const root = process.cwd();
const pwDir = fs.readdirSync(path.join(root, "node_modules", ".pnpm")).filter((d) => d.startsWith("playwright@")).sort().pop();
const req = createRequire(path.join(root, "node_modules", ".pnpm", pwDir, "node_modules", "playwright", "package.json"));
const { chromium, devices } = req("playwright");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg("base", "http://localhost:3002");
const DAY = new Date().toISOString().slice(0, 10);
const QA = process.argv.includes("--qa");
const outDir = QA ? path.join(root, "documents", "qa", "console-mobile") : path.join(root, "documents", "remotion-assets", `console-mobile-${DAY}`);
fs.mkdirSync(outDir, { recursive: true });

// Dev client «شركة جبر سيو» (memory: console-local-check-account) and one of its published articles.
const LOGIN = { id: "شركة-جبر-سيو", password: "Test-Console-2026!" };
const ARTICLE = "6ab0d84fd5eaaff47fd48088";

// [file slug, screen name, url] — signed-out screens first, then every dashboard route.
const OUT = [
  ["login", "تسجيل الدخول", "/login"],
  ["signed-out", "تم تسجيل الخروج", "/signed-out"],
];
const IN = [
  ["dashboard", "الرئيسية", "/dashboard"],
  ["analytics", "الإحصائيات", "/dashboard/analytics"],
  ["articles", "المقالات", "/dashboard/articles"],
  ["article", "مقال", `/dashboard/articles/${ARTICLE}`],
  ["article-preview", "معاينة المقال", `/dashboard/articles/${ARTICLE}/preview`],
  ["questions", "أسئلة مقالاتك", "/dashboard/questions"],
  ["comments", "التعليقات", "/dashboard/comments"],
  ["client-comments", "تعليقات صفحتك", "/dashboard/client-comments"],
  ["client-reviews", "تقييمات نشاطك", "/dashboard/client-reviews"],
  ["faqs", "الأسئلة الشائعة", "/dashboard/faqs"],
  ["page-faq", "أسئلة صفحتك", "/dashboard/page-faq"],
  ["page-content", "محتوى الموقع", "/dashboard/page-content"],
  ["my-site", "تصميم الموقع", "/dashboard/my-site"],
  ...["home", "about", "services", "photos", "reviews", "articles", "faq", "contact", "book"].map((k) => [`site-page-${k}`, `صفحة الموقع · ${k}`, `/dashboard/site-pages/${k}`]),
  ["media", "الوسائط", "/dashboard/media"],
  ["gallery", "المعرض", "/dashboard/gallery"],
  ["reels", "الريلز", "/dashboard/reels"],
  ["videos", "الفيديو", "/dashboard/videos"],
  ["bookings", "الحجوزات", "/dashboard/bookings"],
  ["leads", "العملاء المحتملون", "/dashboard/leads"],
  ["subscribers", "المشتركون", "/dashboard/subscribers"],
  ["campaigns", "الحملات", "/dashboard/campaigns"],
  ["seo-keywords", "الكلمات المفتاحية", "/dashboard/seo/keywords"],
  ["seo-competitors", "المنافسون", "/dashboard/seo/competitors"],
  ["seo-intake", "أسئلة البداية", "/dashboard/seo/intake"],
  ["site-health", "صحة الموقع", "/dashboard/site-health"],
  ["invoices", "الفواتير", "/dashboard/invoices"],
  ["documents", "المستندات", "/dashboard/documents"],
  ["support", "الدعم", "/dashboard/support"],
  ["profile", "الملف الشخصي", "/dashboard/profile"],
  ["settings", "الإعدادات", "/dashboard/settings"],
  ["help", "المساعدة", "/help"],
  ["help-console", "دليل الكونسول", "/help/console"],
  ["help-general", "أسئلة عامة", "/help/general"],
  ["site-preview", "معاينة الموقع", "/site-preview"],
];

const settle = async (page) => {
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  // Suspense sections (Google numbers, charts) stream in after the first paint.
  for (let i = 0; i < 20; i++) {
    const busy = await page.locator(".animate-pulse, [aria-busy=true]").count().catch(() => 0);
    if (!busy) break;
    await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(1500);
};

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices["iPhone 14"], locale: "ar-SA", colorScheme: "light" });
// No dev-server badge in a shot meant for a video: Next's dev indicator lives in <nextjs-portal>.
await context.addInitScript(() => {
  const hide = () => {
    if (document.getElementById("__remotion_hide")) return;
    const st = document.createElement("style");
    st.id = "__remotion_hide";
    st.textContent = "nextjs-portal{display:none!important}";
    document.documentElement.appendChild(st);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hide);
  else hide();
});
const page = await context.newPage();
const shots = [];
let n = 0;

async function shoot([slug, screen, url]) {
  n += 1;
  const base = `${String(n).padStart(2, "0")}-${slug}`;
  const rec = { screen, url, screenFile: `${base}.png`, fullFile: `${base}-full.png` };
  try {
    const res = await page.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await settle(page);
    rec.status = res?.status() ?? null;
    rec.finalUrl = page.url().replace(BASE, "");
    await page.screenshot({ path: path.join(outDir, rec.screenFile) });
    await page.screenshot({ path: path.join(outDir, rec.fullFile), fullPage: true }).catch(() => { delete rec.fullFile; });
    if (QA) rec.audit = await audit(page, { allTaps: true });
  } catch (e) {
    rec.error = String(e).slice(0, 200);
  }
  shots.push(rec);
  console.log(String(n).padStart(2, "0"), rec.status ?? "ERR", url, rec.finalUrl && rec.finalUrl !== url ? `→ ${rec.finalUrl}` : "", rec.error ?? "",
    rec.audit ? `overflow=${rec.audit.overflowPx} tiny=${rec.audit.tiny.length} near=${rec.audit.near.length} text<12=${rec.audit.smallText.length}` : "");
}

for (const s of OUT) await shoot(s);

// Sign in through the real form (identifier = slug or email).
await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
await settle(page);
await page.fill("#login-identifier", LOGIN.id);
await page.fill("#login-password", LOGIN.password);
await page.locator("form button[type=submit]").click();
await page.waitForURL(/\/dashboard/, { timeout: 60000 });

// The first-visit welcome is a screen of its own (it opens over the dashboard once) — shot, then
// dismissed with «لاحقاً» so it does not cover every screen after it.
await settle(page);
const later = page.getByRole("button", { name: "لاحقاً" });
if (await later.isVisible().catch(() => false)) {
  n += 1;
  const base = `${String(n).padStart(2, "0")}-welcome`;
  await page.screenshot({ path: path.join(outDir, `${base}.png`) });
  shots.push({ screen: "الترحيب — أول زيارة", url: "/dashboard", screenFile: `${base}.png`, ...(QA ? { audit: await audit(page, { allTaps: true }) } : {}) });
  console.log(String(n).padStart(2, "0"), "welcome dialog");
  await later.click();
  await page.waitForTimeout(800);
}

for (const s of IN) await shoot(s);

// QA: the side menu is a screen of its own on a phone (the sheet the ☰ opens).
if (QA) {
  n += 1;
  const base = `${String(n).padStart(2, "0")}-menu-open`;
  const rec = { screen: "القائمة الجانبية مفتوحة", url: "/dashboard", screenFile: `${base}.png` };
  try {
    await page.goto(BASE + "/dashboard", { waitUntil: "domcontentloaded" });
    await settle(page);
    await page.getByRole("button", { name: "فتح القائمة" }).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(outDir, rec.screenFile) });
    rec.audit = await audit(page, { allTaps: true });
  } catch (e) {
    rec.error = String(e).slice(0, 200);
  }
  shots.push(rec);
  console.log(String(n).padStart(2, "0"), "menu", rec.error ?? "", rec.audit ? `overflow=${rec.audit.overflowPx} tiny=${rec.audit.tiny.length} near=${rec.audit.near.length} text<12=${rec.audit.smallText.length}` : "");
}
await browser.close();

if (QA) {
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const bad = shots.filter((s) => s.error || s.audit?.overflowPx || s.audit?.tiny.length).length;
  const notes = shots.filter((s) => s.audit?.near.length || s.audit?.smallText.length).length;
  fs.writeFileSync(path.join(outDir, "shots.json"), JSON.stringify(shots, null, 2));
  fs.writeFileSync(
    path.join(outDir, "index.html"),
    `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>فحص الكونسول على الجوّال</title>
<style>body{font-family:Tajawal,system-ui,sans-serif;margin:24px;background:#f6f6f7;color:#111}h1{font-size:20px}
.sum{background:#fff;border:1px solid #e3e3e6;border-radius:12px;padding:10px 14px;margin-bottom:16px;font-size:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:18px}
figure{margin:0;background:#fff;border:1px solid #e3e3e6;border-radius:12px;padding:10px}figure.warn{border-color:#d33}
img{width:100%;border-radius:8px;border:1px solid #eee}figcaption{font-size:13px}small{color:#666;display:block;direction:ltr;text-align:right}
ul{margin:6px 0 0;padding:0 16px 0 0;font-size:12px}.bad{color:#c00;font-weight:700}.ok{color:#0a7}.note{color:#666}</style></head><body>
<h1>فحص الكونسول على الجوّال — iPhone 14 (390×844) · ${DAY}</h1>
<p class="sum">${shots.length} شاشة · مشاكل حمراء (أعرض من الشاشة · زر أصغر من 32×24 · خطأ تحميل): <b>${bad}</b> · ملاحظات (زر بين ذلك و44 · نص أصغر من 12px): <b>${notes}</b></p>
<div class="grid">${shots
      .map((s) => {
        const a = s.audit;
        const lines = s.error
          ? `<li class="bad">${esc(s.error)}</li>`
          : a
            ? `${a.overflowPx ? `<li class="bad">أعرض من الشاشة بـ${a.overflowPx}px</li>${a.wide.map((w) => `<li class="bad" dir="ltr">${esc(w)}</li>`).join("")}` : `<li class="ok">بعرض الشاشة</li>`}${a.tiny.length ? a.tiny.map((t) => `<li class="bad">زر صغير جداً — ${esc(t)}</li>`).join("") : `<li class="ok">الأزرار بحجم الإصبع (${a.tapsChecked} عنصر)</li>`}${a.near.length ? `<li class="note">${a.near.length} زر أقل من 44px — ${esc(a.near.slice(0, 3).join(" · "))}</li>` : ""}${a.smallText.length ? `<li class="note">${a.smallText.length} نص أصغر من 12px — ${esc(a.smallText.slice(0, 3).join(" · "))}</li>` : ""}`
            : "";
        return `<figure class="${s.error || a?.overflowPx || a?.tiny.length ? "warn" : ""}"><a href="${s.fullFile ?? s.screenFile}"><img loading="lazy" src="${s.screenFile}" alt=""></a><figcaption><b>${esc(s.screen)}</b><small>${esc(s.url)}</small><ul>${lines}</ul></figcaption></figure>`;
      })
      .join("")}</div></body></html>`,
  );
  console.log(`QA done → ${path.relative(root, outDir)} · screens ${shots.length} · red ${bad} · notes ${notes}`);
  process.exit(0);
}

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify({ device: "iPhone 14 · 390 CSS px · DPR 3", captured: `${DAY} (dev · شركة جبر سيو)`, pages: shots.length, shots }, null, 2),
);
fs.writeFileSync(
  path.join(outDir, "index.html"),
  `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>الكونسول على الجوال</title>
<style>body{font-family:Tajawal,system-ui,sans-serif;margin:24px;background:#f6f6f7;color:#111}h1{font-size:20px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:18px}
figure{margin:0;background:#fff;border:1px solid #e3e3e6;border-radius:12px;padding:10px}
img{width:100%;border-radius:8px;border:1px solid #eee}figcaption{font-size:13px;margin-top:6px}
small{color:#666;display:block;direction:ltr;text-align:right}.err{color:#b00}</style></head><body>
<h1>الكونسول على الجوال — ${shots.length} شاشة · iPhone 14 · ${DAY}</h1>
<div class="grid">${shots
    .map((s) => `<figure>${s.screenFile && !s.error ? `<a href="${s.fullFile ?? s.screenFile}"><img loading="lazy" src="${s.screenFile}" alt=""></a>` : ""}<figcaption>${s.screen}<small>${s.url}${s.finalUrl && s.finalUrl !== s.url ? ` → ${s.finalUrl}` : ""}</small>${s.error ? `<span class="err">${s.error}</span>` : ""}</figcaption></figure>`)
    .join("")}</div></body></html>`,
);
console.log(`done → ${path.relative(root, outDir)} (${shots.length} screens)`);
