# MASTER TODO — MODONTY
> **آخر تحديث:** 2026-04-19 (Session 47)
> **الإصدار الحالي:** admin v0.36.0 | modonty v1.33.0 | console v0.1.2
> المهام المنجزة في → [🏆 MASTER-DONE.md](🏆%20MASTER-DONE.md)

---

# ⚠️ POST-PUSH — إجراءات يدوية باقية

- [ ] Verify `admin.modonty.com` live and accessible
- [ ] Run `setup-ttl-indexes.ts` on PROD DB
- [ ] Add `.playwright-mcp/` to `.gitignore`

---

# 🔴 CRITICAL

- [ ] **OBS-027** — Industries listing shows "12 شركات" but detail shows "0 شركة موثوقة"
  - Listing counts ALL clients; detail filters `subscriptionStatus: ACTIVE` only
  - **Fix A (quick):** Set production clients to `subscriptionStatus: ACTIVE` in Admin
  - **Fix B (correct):** Align listing query to count ACTIVE clients only

---

# 🌐 MODONTY — Public Site

## 🔴 HIGH

- [ ] **USR-R3** — Notification Settings UI — schema done (`notificationPreferences Json?`) — يحتاج settings UI + email guard

## 🟡 MEDIUM — RightSidebar

- [ ] **SIDEBAR-MOD1** — أعد تصميم كارت "جديد مودونتي" — client خاص في DB باسم "مودونتي" + query + إعادة الكارت للـ RightSidebar

## 🟡 MEDIUM — Mobile Phase 2

- [ ] **MOB2** — أضف client avatar + "اسأل العميل" في Zone 1
- [ ] **MOB3** — أضف Newsletter trigger في الشريط
- [ ] **MOB4** — أضف views + questions في meta row
- [ ] **MOB5** — Newsletter overlay على الصورة الرئيسية
- [ ] **MOB6** — حدّث الـ Sheet بالمحتوى الكامل

## 🟡 MEDIUM — Chatbot Phase 2

- [ ] **CHAT-FAQ1** — Admin: صفحة أسئلة مجمّعة حسب التكرار
- [ ] **CHAT-FAQ2** — Admin: زر "حوّل لـ FAQ" — schema done (`ArticleFAQ.source String?`)
- [ ] **CHAT-FAQ3** — Admin: filter حسب الفئة / العميل / المصدر
- [ ] **CHAT-FAQ4** — Modonty: FAQ المحوَّلة تظهر على صفحة المقال

---

# 🛠️ ADMIN

## 🔴 HIGH — Security

- [ ] **OTP-AUDIT-1** — جرد الأماكن التي تحتاج 2FA

## 🟡 MEDIUM — DB Health & Maintenance

- [ ] **DB-1** — DB Stats card — collections count, document count, storage MB + connection health
- [ ] **DB-2** — Orphan Cleaner — unused media, expired OTPs > 30 days, broken ArticleMedia rows
- [ ] **DB-3** — Index Health Check — flag missing TTL/compound indexes on key collections
- [ ] **DB-4** — Slug Integrity Check — duplicate slugs, empty/invalid slugs
- [ ] **DB-5** — Broken References Scanner — articles with deleted featuredImageId / categoryId / authorId

## 🟡 MEDIUM — Media & Editor

- [ ] **UX-5** — رفع صورة بدون مغادرة صفحة المقال — upload + select inline inside article editor

## 🟡 MEDIUM — Email Template Viewer

- [ ] **EMAIL-PREVIEW-1** — صفحة `/modonty/emails` تعرض كل قوالب الإيميل (6 قوالب) — preview HTML + subject + زر "Send Test"

## 🟡 MEDIUM — Misc

- [ ] **AUDIT-5** — bundle size → `pnpm build:analyze` + dynamic imports
- [ ] **SEMR-7b** — `defaultDescription` في Settings
- [ ] **"Featured" label** — "Cover Image" + "Highlight on Homepage"

---

# 📊 CONSOLE

## 🟡 MEDIUM — Manual QA (قبل أول عميل)

- [ ] **QAUDIT-C1** — مراجعة شاملة لكل queries في console
  - Dashboard: C1–C5 · Analytics: C7/C10–C12/C14 · Leads: C15–C17 · Moderation: C22–C30

---

# ⚙️ VERCEL — إجراءات يدوية

- [ ] **AUTH_SECRET** → Vercel env vars
- [ ] **NEXTAUTH_URL** → `https://www.modonty.com`
- [ ] **NEXT_PUBLIC_SITE_URL** → `https://www.modonty.com`
- [ ] **SEMrush** → "Rerun Campaign" بعد آخر deploy (الهدف: ≥ 90%)

---

---

## ✅ DONE — Session 47 (2026-04-19)
- [x] **ScrollProgress duplicate render fixed** — removed direct import+render from TopNav.tsx, now only via FeedDeferredUI (ssr:false). Verified: 1 element in DOM ✅
- [x] **MobileMenu lazy loading** — MobileMenuClient now uses dynamic(ssr:false) + mounted state. MobileMenu JS loads only on first menu click. Verified: menuInDOM=false before click, dialog opens correctly after ✅
- [x] **FollowCard social icons → Server** — 7 social SVGs removed from client bundle. FollowCard.tsx (Server) renders icons. FollowCardInteractive.tsx (new Client) handles form + expand only. Verified: all elements render correctly ✅
- [x] **Social icons → filled style** — LinkedIn, YouTube, Instagram changed from stroke to fill. All 7 icons now consistent filled style ✅
- [x] **Twitter/X dark mode fix** — fill="currentColor" added to SVG path ✅
- [x] **FollowCard icon spacing** — gap-1 + p-0.5 (was gap-0.5 + p-1) ✅
- [x] **FollowCardClient.tsx deleted** — dead code removed ✅
- [x] **Social links synced to modonty_dev** — all 7 platform URLs copied from production DB ✅
- [x] **Client Components audit** — CLIENT-COMPONENTS.md created, 35 components reviewed, 1 deletable (done) ✅

---

> 🟢 LOW items → [💡 NICE-TO-HAVE.md](💡%20NICE-TO-HAVE.md)
