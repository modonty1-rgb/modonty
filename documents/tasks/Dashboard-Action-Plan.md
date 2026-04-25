# Dashboard Rebuild — Action Plan
**آخر تحديث:** 2026-04-25
**المعمارية:** Source-Grouped (3 sections) + Atomic Article Page
**Mockup:** `admin/public/dashboard-mockup-v2.html`
**الحالة:** جاهز للتنفيذ — بانتظار موافقة على الخطة

---

## 🎯 الهدف

إعادة بناء `/dashboard` بمعمارية source-grouped:
- 🔍 **Section 1: Search Console** (GSC)
- 📊 **Section 2: GTM/GA4 Analytics** (placeholder الآن — live integration بعد ما نخلص)
- 💾 **Section 3: Content & Operations** (DB)
- 🚨 **Alert Bar** فوق (cross-source urgent)
- 📅 **Date Range Selector** عام
- 🎯 **Atomic Article Page** (لاحقاً)

---

## 📋 خريطة إعادة الاستخدام (Reuse Map)

### Backend Actions الموجودة (نحتفظ بها):
| Action موجود | يذهب إلى |
|--------------|----------|
| `getDashboardStats()` | Section 3 (DB) — Active Clients · Subscribers |
| `getMonthlyDeliveryStats()` | Section 3 (DB) — Delivery KPI · Progress |
| `getRecentArticles()` | Section 3 (DB) — Top Articles list |
| `getStatusBreakdown()` | `/articles` drill-down |
| `getEngagementQueue()` | Section 3 (DB) — Action Items |
| `getRecentActivity()` | Section 3 (DB) — Mini Activity |
| `getDashboardAlerts()` | Alert Bar (top) |
| `getSubscriptionHealth()` | `/clients` drill-down |
| `getVisitorEngagementStats()` | يُؤجَّل إلى Section 2 (GA4) لاحقاً |

### Components الموجودة (نعيد استخدامها):
| Component | الاستخدام الجديد |
|-----------|-------------------|
| `DashboardAlertsBanner` | يبقى كـ Alert Bar (top) |
| `EngagementQueue` | يُفكّك إلى Action Items داخل Section 3 |
| `VisitorEngagementCard` | يُؤجَّل لـ Section 2 GA4 |
| `SubscriptionHealthCard` | يُنقل إلى `/clients` page |
| `delivery-progress.tsx` | يُنقل إلى `/clients` page |
| `recent-articles.tsx` | يدخل Section 3 (DB) |
| `quick-actions.tsx` | يبقى — sidebar أو header |

### Components الجديدة (نبنيها):
- `DashboardSectionWrapper` — wrapper لكل قسم بحدود وألوان مميزة
- `KpiStrip` — 4 KPIs لكل قسم
- `MiniActionItems` — قائمة action items داخل القسم
- `MiniActivityFeed` — آخر 3-5 أحداث داخل القسم
- `DateRangeSelector` — اليوم / 7d / 28d / 90d (global)
- `GscSection` — Section 1 محدد
- `Ga4PlaceholderSection` — Section 2 (under construction)
- `DbSection` — Section 3 محدد

---

## Phase 1 — Foundation & Layout ✅ DONE (2026-04-25)

> Components بُنيت + TSC نظيف · ينتظر التطبيق في Phase 2-4 للـ live verification

---

## Phase 2 — Section 3 (DB) Refactor ✅ DONE (2026-04-25)

> Section 3 يعمل بالكامل ببيانات حقيقية + Dashboard page الجديدة — placeholders لـ GSC/GA4

---

## Phase 3 — Section 1 (GSC) Build ✅ DONE (2026-04-25)

> Section 1 يعمل ببيانات production GSC حقيقية + Suspense + skeleton + cache

---

## Phase 4 — Section 2 (GA4 Placeholder) — نصف يوم

> **الهدف:** Section 2 جاهز visually لكن "Under Construction"

- [ ] **D-21** — `app/(dashboard)/components/sections/ga4-section.tsx`
  - Server Component (لا data fetching الآن)

- [ ] **D-22** — UI:
  - نفس layout الـ KPI strip (4 خانات)
  - كل KPI يعرض رمز lock (🔒) + "Coming Soon"
  - Background عليه شريط مائل خفيف "UNDER CONSTRUCTION"
  - رسالة شفافة: "GA4 integration is being prepared — coming in next phase"

- [ ] **D-23** — Drill-down link → `/analytics` (نفس الصفحة under construction)

- [ ] **D-24** — `app/(dashboard)/analytics/page.tsx`:
  - صفحة بسيطة "GA4 Analytics — Coming Soon"
  - شرح ما الذي سيكون فيها لاحقاً

**Verify:** Section 2 يظهر بنفس شكل Section 1 و 3 لكن واضح إنه placeholder — لا errors.

---

## Phase 5 — `/seo` Drill-down Page (2-3 أيام)

> **الهدف:** صفحة GSC تفصيلية كاملة

- [ ] **D-25** — `app/(dashboard)/seo/page.tsx` + `layout.tsx` + `loading.tsx`

- [ ] **D-26** — Tab: **Performance**
  - رسم بياني يومي للـ clicks/impressions (Recharts)
  - 4 KPIs مع date range
  - Period comparison toggle (هذا الأسبوع vs الفائت)

- [ ] **D-27** — Tab: **Queries**
  - جدول بـ 50 query: keyword · clicks · impressions · CTR · position
  - Sort + filter + search

- [ ] **D-28** — Tab: **Pages**
  - جدول بـ 50 page: URL · clicks · impressions · CTR · position
  - Link to article in admin

- [ ] **D-29** — Tab: **Sitemaps**
  - List sitemaps + status
  - Submit new + Delete buttons (يستخدم `lib/gsc/sitemaps.ts`)
  - **مهم:** هنا نعمل أول submit لـ `https://www.modonty.com/sitemap.xml`

- [ ] **D-30** — Tab: **URL Inspection**
  - Input لـ URL
  - يعرض: indexed/not, last crawl, mobile, robots, canonical
  - يستخدم `lib/gsc/inspection.ts`

**Verify:** كل tab يعمل — بيانات حقيقية من GSC — sitemap submit/delete يعمل — TSC zero errors — sub-3s load per tab.

---

## Phase 6 — Alert Bar + Date Range Wiring (نصف يوم)

> **الهدف:** Alert Bar ذكي + Date Range يربط الكل

- [ ] **D-31** — توسيع `getDashboardAlerts()` ليشمل GSC alerts:
  - Clicks dropped >20% (compare 7d vs prev 7d)
  - Pages with critical issues (security/manual actions)
  - Articles not indexed > 24h (Phase 2 — يحتاج cache table)

- [ ] **D-32** — Date Range URL state:
  - `?range=7d` → كل sections تستخدم نفس الـ range
  - GSC و DB يستجيبون للتغيير

- [ ] **D-33** — Refresh button:
  - يعمل `revalidateTag("gsc-dashboard")` + `revalidatePath("/dashboard")`

**Verify:** تغيير date range يحدّث كل الأقسام — Alert Bar يظهر فقط عند وجود alert حقيقي — Refresh يعمل.

---

## Phase 7 — Polish & Live Test (نصف يوم)

- [ ] **D-34** — Loading skeletons لكل section
- [ ] **D-35** — Error boundaries لكل section (لو واحد فشل، الباقي يعمل)
- [ ] **D-36** — Mobile responsive (375px, 768px, 1024px)
- [ ] **D-37** — Live test مع Playwright على كل التغييرات
- [ ] **D-38** — Full circle verification: dashboard ↔ /seo ↔ existing pages
- [ ] **D-39** — `pnpm tsc --noEmit` — zero errors
- [ ] **D-40** — حذف الكود القديم اللي مش مستخدم بعد التأكد

**Verify:** كل شيء يعمل على Mobile + Desktop — لا regressions — لا dead code.

---

## ⏱️ Timeline (تقديري)

| Phase | المدة | التراكمي |
|-------|-------|-----------|
| 1. Foundation | 1 يوم | يوم 1 |
| 2. Section 3 (DB) | 1 يوم | يوم 2 |
| 3. Section 1 (GSC) | 3 أيام | يوم 5 |
| 4. Section 2 (GA4 placeholder) | 0.5 يوم | يوم 5.5 |
| 5. `/seo` drill-down | 3 أيام | يوم 8.5 |
| 6. Alert Bar + Date Range | 0.5 يوم | يوم 9 |
| 7. Polish + Live Test | 0.5 يوم | يوم 9.5 |
| **الإجمالي** | **9-10 أيام عمل** | |

---

## 🧠 ملاحظات تقنية مهمة

### Caching Strategy
| المصدر | الطبقة | TTL | Tag |
|--------|--------|-----|------|
| GSC analytics | `unstable_cache` | 3h | `gsc-dashboard` |
| GSC URL Inspection | DB cache table | 7d | per-URL |
| DB live counts | React `cache()` | per-request | — |

### Naming Conventions (CLAUDE.md compliant)
- ملفات: `kebab-case.tsx`
- Components: `PascalCase`
- Server Actions: `camelCase` (action names) في ملف واحد
- `import type` للـ types

### Performance Rules
- Section components = Server Components (default)
- Date Range Selector = Client Component (state)
- Charts = Client Component مع `dynamic({ ssr: false })`
- لا barrel imports (lucide direct icons)

### What NOT to do
- ❌ ما نحذف الكود القديم قبل ما نتأكد من البديل (Phase 7 only)
- ❌ ما نضيف GA4 SDK في الـ admin app — Section 2 = placeholder فقط
- ❌ ما نعمل refactor على `getEngagementQueue` — تم إصلاحه أمس
- ❌ ما نلمس production DB

### Verify Per Phase
- بعد كل phase: `pnpm tsc --noEmit` على الملفات المتغيرة
- بعد Phase 7: full TSC + live test كامل
- لا push بدون موافقة المستخدم

---

## 🎬 الخطوة التالية

**انتظر موافقة على الخطة** ثم نبدأ بـ **Phase 1 — Foundation**.

أي تعديل على الخطة قبل البدء؟
- مدة phase معينة قصيرة/طويلة؟
- ترتيب مختلف؟
- شيء ناقص؟
- شيء زيادة عن اللازم؟

---

## ✅ Done

### Phase 1 — Foundation (2026-04-25)
- [x] **D-01** `dashboard-section.tsx` — wrapper بـ accent border-top + drill-down
- [x] **D-02** `kpi-strip.tsx` — KPI cards مع sparkline SVG + delta + progress
- [x] **D-03** `mini-action-items.tsx` — قائمة action items بـ severity colors
- [x] **D-04** `mini-activity-feed.tsx` — events feed مع source badges (GSC/GA4/DB)
- [x] **D-05** `date-range-selector.tsx` — client component مع URL state (today/7d/28d/90d)
- ✅ **Verify:** TSC zero errors

### Phase 2 — Section 3 (DB) Refactor (2026-04-25)
- [x] **D-06** `sections/db-section.tsx` — Server Component يستهلك 5 actions موجودة
- [x] **D-07** 4 KPIs: Articles This Month · Subscribers · Clients · Pending
- [x] **D-08** Recent Articles list (column 1)
- [x] **D-09** Action Items (column 2) — FAQs · messages · comments
- [x] **D-10** Mini Activity (column 3) — RecentActivity مُحوَّل لـ ActivityEvent
- [x] **D-11** Drill-down → `/articles`
- [x] **Page rewrite:** `app/(dashboard)/page.tsx` — 3 sections + Alert Bar + Date Range
- [x] Placeholders for GSC (Phase 3) + GA4 (Phase 4)
- ✅ **Verify:** TSC zero errors · live test على `/` يعرض الـ 3 sections بياناتها صحيحة

### Phase 3 — Section 1 (GSC) Build (2026-04-25)
- [x] **D-12** `sections/gsc-section.tsx` — Server Component مع try/catch fallback
- [x] **D-13** 4 KPIs: Clicks · Impressions · CTR · Avg Position (delta vs previous period)
- [x] **D-14** Top Queries column (5 items) — Arabic-aware decode
- [x] **D-15** Top Pages column (5 items) + Action Items (low CTR detection + opportunity queries)
- [x] **D-16** "SEO Insights" column مع شعار "Performance looks healthy" عند صحة الأداء
- [x] **D-17** Drill-down → `/seo`
- [x] **D-18** `lib/gsc/cached.ts` — `unstable_cache` بـ 3h TTL + tag `gsc-dashboard`
- [x] **D-19** `gsc-section-skeleton.tsx` — KPI strip + 3-column skeleton متطابق مع المعمارية
- [x] **D-20** Error fallback: لو GSC API فشل، يعرض رسالة في نفس الـ DashboardSection
- [x] Wired with `<Suspense fallback={<GscSectionSkeleton />}>` لتدفق الصفحة بدون انتظار GSC
- ✅ **Verify:** TSC zero errors · live test ببيانات production: 8 clicks · 18 impressions · CTR 44.4% · pos 1.7
- ✅ **Inbox feature (extra):** `/inbox` + `/inbox/[clientId]` — client-first hierarchy
