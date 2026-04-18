# MASTER TODO — MODONTY
> **آخر تحديث:** 2026-04-19 (Sessions 41–45 — PUSHED ✅ admin v0.36.0 + modonty v1.33.0)
> **الإصدار الحالي:** admin v0.36.0 | modonty v1.33.0 | console v0.1.2
> المهام المنجزة في → [MASTER-DONE.md](MASTER-DONE.md)

---

# ⚠️ POST-PUSH (manual actions pending)

- [x] ✅ Version bump: admin → v0.36.0, modonty → v1.33.0
- [x] ✅ Run backup: `bash scripts/backup.sh` — 59 collections, 2.2M
- [x] ✅ TSC both apps — zero errors
- [ ] Add `TELEGRAM_BOT_TOKEN` + `TELEGRAM_ADMIN_CHAT_ID` to Vercel env vars (modonty)
- [ ] Run `setup-ttl-indexes.ts` on PROD DB
- [ ] Verify Vercel build + modonty.com + admin.modonty.com live
- [ ] Add `.playwright-mcp/` to `.gitignore` (dev artifacts committed accidentally)

---

# 🌐 MODONTY — Public Site

## 🔴 HIGH — حسابات المستخدمين

- [ ] **USR-R3** — Notification Settings UI — schema done (`notificationPreferences Json?`) — يحتاج settings UI + email guard

---

## 🟡 MEDIUM — صفحات ناقصة

- [x] ✅ بناء `/industries` listing page — مكتمل (page.tsx + loading.tsx + getIndustriesWithCounts updated)

## 🟡 MEDIUM — RightSidebar: جديد مودونتي

- [ ] **SIDEBAR-MOD1** — أعد تصميم كارت "جديد مودونتي" — مودونتي ستنشر مقالات باسمها (كـ Facebook/منصة تتحدث عن نفسها). يحتاج: client خاص في الـ DB باسم "مودونتي" + query يجلب منه فقط + إعادة الكارت للـ RightSidebar. حالياً: الكارت محذوف ومساحته لـ"شركاء النجاح".

## ✅ DONE — Session 44: NewClientsCard Scroll + Radix ScrollArea Fix

- [x] ✅ **NewClientsCard all clients visible** — root cause: seed ran against `modonty` (prod DB) instead of `modonty_dev`. Re-seeded correct DB. All 16 clients now appear.
- [x] ✅ **ScrollArea explicit height** — switched from `flex-1 min-h-0` (Radix Viewport `height:100%` doesn't resolve in flex context) to `h-[calc(100vh-17rem)]` (context7 confirmed: ScrollArea needs explicit height). Root=628px, Viewport=628px, scrolls automatically when items overflow.
- [x] ✅ **RTL scrollbar** — added `dir="rtl"` to ScrollArea for correct scrollbar position on inline-end (left side in RTL).
- [x] ✅ **`unstable_cacheTag` deprecation warning** — fixed import in `tag-queries.ts`: `unstable_cacheTag` → `cacheTag` (stable in Next.js 16.1.6).
- [x] ✅ **max-h viewport bound** — Card gets `max-h-[calc(100dvh-14rem)]` as safety cap even when flex gives it the right size.
- [x] ✅ **"عرض الكل" → "استكشف"** — في NewClientsCard، كلمة أكثر إنسانية وتناسب هوية المنصة.
- [x] ✅ **`vh` → `dvh` global replace** — all 6 files in modonty replaced `100vh` with `100dvh` (context7/Tailwind confirmed: `dvh` adjusts dynamically as mobile browser address bar shows/hides; `vh` is unreliable on mobile). Files: RightSidebar, NewClientsCard, LeftSidebar, SidebarSkeletons, articles/[slug]/page, loading.tsx.

---

## ✅ DONE — Session 42: Sidebar Overflow Fix + AnalyticsCard Collapse

- [x] ✅ **Sidebar footer overlay** — root cause found: inner div had no height constraint → content overflowed aside boundary → covered footer. Fix: `overflow-hidden` on both asides + `h-[calc(100vh-3.5rem-133px)]` (navbar=57px, footer=133px measured). Sidebars always fully visible between navbar and footer.
- [x] ✅ **AnalyticsCard collapse** — default shows 3 stats (المقالات، مشاهدات، تفاعلات) + "المزيد ∨" button to expand all 6. `'use client'` + `useState`. Regular import (SSR preserved for FCP + SEO).
- [x] ✅ **AnalyticsCard collapse removed** — شيل الـ collapse وعرض الـ 6 stats دائماً. الكارت رجع Server Component نظيف (شيل `'use client'` + `useState` + زر "المزيد"). المساحة متوفرة في الـ left sidebar.
- [x] ✅ **CategoriesCard collapse** — default shows top 3 categories by articleCount + "المزيد (N)" button. `'use client'` + `useState`. Same pattern as AnalyticsCard.
- [x] ✅ **IndustriesCard collapse** — default shows top 3 industries by clientCount + "المزيد (N)" button. Same pattern. Button auto-hides when ≤3 industries.

---

## ✅ DONE — Session 41: Sidebar UX Overhaul

- [x] ✅ **IndustriesCard** — added to LeftSidebar (always visible, flex-none)
- [x] ✅ **LeftSidebar width** — 240px → 300px (matches RightSidebar, balanced layout)
- [x] ✅ **AnalyticsCard** — redesigned from 6 vertical rows → compact 3×2 grid (~130px vs ~260px)
- [x] ✅ **CategoriesCard** — `flex-1` → `flex-none` + `max-h-[160px] overflow-y-auto` (الصناعات always visible)
- [x] ✅ **SocialCard** replaced by **FollowCard** — newsletter form + social icons (no more empty broken box)
- [x] ✅ **RightSidebar More card** — added الصناعات, الوسوم, legal links (footer now redundant for navigation)
- [x] ✅ **Sticky footer overlay** fixed — `h-[calc(100vh-4rem)]` on both asides (no more sidebar/footer overlap)
- [x] ✅ **SidebarSkeletons** — updated to match all new dimensions and structure

---

## 🟡 MEDIUM — Mobile Phase 2

- [ ] **MOB2** — أضف client avatar + "اسأل العميل" في Zone 1
- [ ] **MOB3** — أضف Newsletter trigger في الشريط
- [ ] **MOB4** — أضف views + questions في meta row
- [ ] **MOB5** — Newsletter overlay على الصورة الرئيسية
- [ ] **MOB6** — حدّث الـ Sheet بالمحتوى الكامل

---

## 🟡 MEDIUM — Chatbot Phase 2

- [ ] **CHAT-FAQ1** — Admin: صفحة أسئلة مجمّعة حسب التكرار
- [ ] **CHAT-FAQ2** — Admin: زر "حوّل لـ FAQ" — schema done (`ArticleFAQ.source String?`)
- [ ] **CHAT-FAQ3** — Admin: filter حسب الفئة / العميل / المصدر
- [ ] **CHAT-FAQ4** — Modonty: FAQ المحوَّلة تظهر على صفحة المقال

---

# 🛠️ ADMIN

## 🔴 HIGH — Security: OTP Audit

- [ ] **OTP-AUDIT-1** — جرد الأماكن التي تحتاج 2FA
- [ ] **OTP-AUDIT-4** — تأكيد Telegram Bot token في Vercel env vars

---

## 🟡 MEDIUM — DB Health & Maintenance

- [ ] **DB-1** — DB Stats card — collections count, document count, storage MB + connection health
- [ ] **DB-2** — Orphan Cleaner — unused media, expired OTPs > 30 days, broken ArticleMedia rows
- [ ] **DB-3** — Index Health Check — flag missing TTL/compound indexes on key collections
- [ ] **DB-4** — Slug Integrity Check — duplicate slugs, empty/invalid slugs
- [ ] **DB-5** — Broken References Scanner — articles with deleted featuredImageId / categoryId / authorId

---

## 🟡 MEDIUM — Inline Media Picker

- [ ] **UX-5** — رفع صورة بدون مغادرة صفحة المقال — upload + select inline inside article editor

---

## 🟡 MEDIUM — Email Template Viewer

- [ ] **EMAIL-PREVIEW-1** — صفحة `/modonty/emails` تعرض كل قوالب الإيميل (6 قوالب)
  - preview HTML + subject + زر "Send Test" · تصنيف: Visitor | Client

---

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

> 🟢 LOW items → [💡 NICE-TO-HAVE.md](💡%20NICE-TO-HAVE.md)
