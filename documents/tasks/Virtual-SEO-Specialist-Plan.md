# Virtual SEO Specialist — Master Plan
**⚠️ SUPERSEDED — راجع [Perfect-SEO-Plan.md](Perfect-SEO-Plan.md) للخطة الكاملة 100% (108 task / 13 phase)**

**آخر تحديث:** 2026-04-25
**الرؤية:** Dashboard + Search Console page = **1,000,000% Perfect SEO** بدون توظيف SEO Specialist بشري
**الحالة:** متوقف — استبدلها Perfect-SEO-Plan.md التي تغطي 95% بدلاً من 85%

---

## 🎯 الفلسفة الأساسية

| | |
|-|-|
| **الهدف الأساسي** | كل ما يفعله SEO Specialist بشري → يحدث آلياً في الأدمن |
| **النتيجة المرغوبة** | modonty يصبح "Perfect SEO" دون فتح Google Search Console مرة |
| **القيمة الاقتصادية** | توفير راتب SEO Specialist (~3000-7000 ريال/شهر) |
| **القيمة الزمنية** | توفير 10-15 ساعة/أسبوع من العمل اليدوي |

---

## 🏗️ المعمارية — Dashboard vs Search Console Page

> **القرار:** Dashboard = **figures + alerts فقط** · `/search-console` = **التفاصيل + Actions الكاملة**

### Dashboard (الصفحة الرئيسية `/`)
**الوظيفة:** "نظرة سريعة" + "اللي محتاج اهتمام الآن"
- ✅ KPIs (Clicks · Impressions · CTR · Position)
- ✅ Coverage Alert (live · need removal · need indexing · coverage %)
- ✅ Top Queries / Top Pages (5 each)
- ✅ SEO Insights (3-5 action items)
- ⏳ Critical alerts: Manual action · Security · Position drop · CWV failure
- ⏳ Health score (واحد رقم يلخص الصحة العامة)

كل KPI أو alert → click → يأخذنا للـ `/search-console` للتفاصيل والإجراءات.

### Search Console Page (`/search-console`) — يستبدل `/seo`
**الوظيفة:** كل تفاصيل SEO + كل الـ actions

#### Tabs المقترحة:
1. **Overview** — Health score + critical alerts + summary cards
2. **Coverage** — كل URLs المفهرسة مع status + actions (موجود)
3. **Performance** — جدول قابل للفلترة (Queries · Pages · Countries · Devices)
4. **Indexing** — URL Inspection + Sitemaps + Indexing API
5. **Web Vitals** — CWV per page + PageSpeed scores
6. **Content Health** — Title/Meta/H1/Alt audit
7. **Schema** — Validation results + errors
8. **Alerts** — Manual actions · Security · Anomalies
9. **Reports** — Weekly digest + custom reports

---

## 📋 خريطة المهام — SEO Specialist → Dashboard

### 1. الفهرسة والتغطية (Indexing & Coverage)

| المهمة الـ SEO Specialist | Dashboard (figure/alert) | Search Console (full) |
|---------------------------|--------------------------|------------------------|
| فحص URL coverage | ✅ "X live · Y need removal · Z need indexing" | ✅ Coverage tab |
| Crawled but not indexed | ⏳ Count alert | ⏳ List + reasons + actions |
| Soft 404 detection | ⏳ Count alert | ⏳ List + page-by-page review |
| Robots.txt blocking | ⏳ Count alert | ⏳ List + fix suggestions |
| Canonical issues | ⏳ Count alert | ⏳ Per-URL: declared vs Google's |
| Sitemap status | ⏳ "X URLs · Last submitted Yh ago" | ⏳ Submit/delete + status |

### 2. الأداء (Performance)

| المهمة | Dashboard | Search Console |
|--------|-----------|----------------|
| Clicks/Impressions/CTR/Position | ✅ KPIs | ✅ Detailed tables |
| Top queries | ✅ Top 5 | ⏳ Top 50 with filter |
| Position drops > 5 | ⏳ Alert | ⏳ List with history chart |
| Cannibalization (نفس query على عدة URLs) | ⏳ Count | ⏳ Per-query analysis |
| Dying queries (traffic declining 4+ weeks) | ⏳ Count | ⏳ List + recommendations |

### 3. Core Web Vitals (CWV)

| المهمة | Dashboard | Search Console |
|--------|-----------|----------------|
| Site-wide CWV health | ⏳ "Good X · Needs improvement Y · Poor Z" | ⏳ Detailed breakdown |
| Per-page LCP / CLS / INP | ⏳ Critical alerts | ⏳ Table per page |
| PageSpeed score | ⏳ Avg score | ⏳ Per-page with details |
| Field data (CrUX) | ⏳ Trend | ⏳ History chart |

### 4. Content Health (Content Optimization)

| المهمة | Dashboard | Search Console |
|--------|-----------|----------------|
| Missing meta descriptions | ⏳ Count | ⏳ List + bulk fix |
| Duplicate titles | ⏳ Count | ⏳ List with conflict |
| Title length issues (< 30 or > 60) | ⏳ Count | ⏳ Filter + edit |
| Missing alt text on images | ⏳ % coverage | ⏳ List + bulk fix |
| H1 issues (multiple/missing) | ⏳ Count | ⏳ List |
| Word count vs query intent | ⏳ Avg | ⏳ Per article |
| Outdated content (> 6 months) | ⏳ Count | ⏳ List + refresh suggestions |

### 5. Schema / Structured Data

| المهمة | Dashboard | Search Console |
|--------|-----------|----------------|
| Schema errors total | ⏳ Count alert | ⏳ Per-page errors |
| Rich result eligibility | ⏳ % eligible | ⏳ List + missing fields |
| FAQ schema coverage | ⏳ Count | ⏳ Per article |

### 6. Critical Alerts

| المهمة | Dashboard | Search Console |
|--------|-----------|----------------|
| Manual actions | ⏳ Banner (red) | ⏳ Full details + appeal flow |
| Security issues | ⏳ Banner (red) | ⏳ Affected URLs |
| Mobile usability errors | ⏳ Count | ⏳ Per-page fixes |
| HTTPS / mixed content | ⏳ Count | ⏳ List |

### 7. Reports & Automation

| المهمة | Dashboard | Search Console |
|--------|-----------|----------------|
| Weekly digest | ⏳ Last sent indicator | ⏳ Configure + history |
| Anomaly detection | ⏳ Live alerts | ⏳ Tune thresholds |
| Telegram alerts | ⏳ Count sent | ⏳ Subscribe/unsubscribe |
| Auto-indexing on publish | ⏳ Status indicator | ⏳ History log |

### 8. International SEO

| المهمة | Dashboard | Search Console |
|--------|-----------|----------------|
| hreflang validation | ⏳ Count issues | ⏳ Per-page validation |
| Geo-targeting | ⏳ Status | ⏳ Country breakdown |

---

## 🚀 خطة التنفيذ — Phases P3 إلى P10

### ✅ Phase 1-2: Foundation (مكتمل)
- Coverage Visibility · Indexing API actions · Archive 410

---

### 🟦 Phase 3: Rename + URL Inspection Deep Data (يومان)
> **الهدف:** هيكل المسمى + بيانات تفصيلية لكل URL

- [ ] **VS-01** — Rename route: `/seo` → `/search-console`
- [ ] **VS-02** — Update sidebar + all internal links + Dashboard drill-downs
- [ ] **VS-03** — Build URL Inspection cache (DB table `gscUrlInspection`) — لتجنب الـ 2,000/day quota
- [ ] **VS-04** — `/search-console` Coverage tab: عرض `verdict · coverageState · canonical · robotsTxt · mobileUsability` لكل URL
- [ ] **VS-05** — Bulk inspect button: يفحص all PUBLISHED articles ويخزن في DB
- [ ] **VS-06** — Dashboard alert: "X canonical issues · Y robots blocked · Z soft 404"

### 🟧 Phase 4: Core Web Vitals (3 أيام)
> **الهدف:** صحة الأداء التقنية لكل صفحة

- [ ] **VS-07** — `lib/gsc/pagespeed.ts` — PageSpeed Insights API
- [ ] **VS-08** — `lib/gsc/crux.ts` — Chrome UX Report API
- [ ] **VS-09** — DB cache: `pageSpeedSnapshot` (per URL, 24h TTL)
- [ ] **VS-10** — Dashboard CWV widget: "Good X · Needs improvement Y · Poor Z"
- [ ] **VS-11** — `/search-console` Web Vitals tab: per-page table + history
- [ ] **VS-12** — Auto-test on publish: trigger PageSpeed for new article

### 🟨 Phase 5: Content Health Audit (3-4 أيام)
> **الهدف:** تدقيق المحتوى تلقائياً

- [ ] **VS-13** — `lib/seo/content-audit.ts` — يفحص kل article ويرجع issues:
  - Title length (< 30 or > 60)
  - Meta description (missing / length)
  - H1 (missing / multiple)
  - Word count
  - Image alt coverage
  - Internal links count
- [ ] **VS-14** — Run on cron + cache results
- [ ] **VS-15** — Dashboard: "X articles need content fixes"
- [ ] **VS-16** — `/search-console` Content Health tab: filter + bulk fix dialogs
- [ ] **VS-17** — Smart recommendations per article ("Title too short · Add alt to 3 images")

### 🟩 Phase 6: Schema Validation (2 أيام)
> **الهدف:** Rich Results جاهزة 100%

- [ ] **VS-18** — Schema validator helper (يقرأ JSON-LD ويفحصه)
- [ ] **VS-19** — Per-article validation cache
- [ ] **VS-20** — Dashboard: "X schema errors · Y eligible for rich results"
- [ ] **VS-21** — `/search-console` Schema tab: errors list + fix instructions

### 🟪 Phase 7: Anomaly Detection + Critical Alerts (2 أيام)
> **الهدف:** الإنذار المبكّر

- [ ] **VS-22** — Daily snapshot job: يخزّن KPIs/CWV/coverage يومياً
- [ ] **VS-23** — Anomaly logic: clicks/impressions/position drops
- [ ] **VS-24** — Manual actions + Security check (GSC API)
- [ ] **VS-25** — Dashboard banner (red) للـ critical
- [ ] **VS-26** — `/search-console` Alerts tab: history + acknowledge

### 🟦 Phase 8: Cannibalization + Outdated Content (2 أيام)
> **الهدف:** اكتشاف مشاكل المحتوى الذكية

- [ ] **VS-27** — Cannibalization detector (نفس query على > 1 URL)
- [ ] **VS-28** — Outdated detector (last update > 6 months + has impressions)
- [ ] **VS-29** — Dashboard: "X cannibalization · Y outdated"
- [ ] **VS-30** — `/search-console` Performance tab: drill into per-query

### 🟥 Phase 9: Reports & Automation (2 أيام)
> **الهدف:** كل أسبوع تقرير تلقائي

- [ ] **VS-31** — Weekly digest builder (top wins · top issues · key metrics)
- [ ] **VS-32** — Telegram bot integration (إرسال أسبوعي)
- [ ] **VS-33** — Email digest (احتياطي)
- [ ] **VS-34** — Daily anomaly Telegram alert
- [ ] **VS-35** — Auto-indexing on publish (server action hook)
- [ ] **VS-36** — Auto-notify deleted على archive/delete

### 🟫 Phase 10: International SEO + Final Polish (1 يوم)
> **الهدف:** Perfect SEO

- [ ] **VS-37** — hreflang validation
- [ ] **VS-38** — Internal links broken detector
- [ ] **VS-39** — Health score algorithm (0-100 weighted)
- [ ] **VS-40** — Dashboard final: Health score + 1-line summary

---

## ⏱️ Timeline

| Phase | المدة | التراكمي |
|-------|-------|-----------|
| 3. Rename + URL Inspection | 2 أيام | يوم 2 |
| 4. Core Web Vitals | 3 أيام | يوم 5 |
| 5. Content Health | 4 أيام | يوم 9 |
| 6. Schema | 2 أيام | يوم 11 |
| 7. Anomaly + Critical | 2 أيام | يوم 13 |
| 8. Cannibalization + Outdated | 2 أيام | يوم 15 |
| 9. Reports + Automation | 2 أيام | يوم 17 |
| 10. International + Polish | 1 يوم | يوم 18 |
| **الإجمالي** | **~18 يوم عمل** | |

---

## 🎯 معايير النجاح (Definition of Done)

عند اكتمال كل المراحل:
- ✅ صاحب المنتج لا يفتح Google Search Console أبداً
- ✅ كل صباح: dashboard يقول له "اعمل X" بترتيب الأولوية
- ✅ كل أسبوع: Telegram message بـ summary + wins + issues
- ✅ صفر صفحات بمشاكل canonical / robots / soft 404
- ✅ صفر articles بدون title/meta/h1
- ✅ صفر schema errors
- ✅ Core Web Vitals: > 90% pages في "Good"
- ✅ كل مقال جديد: مفهرس خلال ساعة + اختبر CWV
- ✅ Health score > 95/100

---

## 🔗 ملفات مرتبطة

- [URL-Lifecycle-Plan.md](URL-Lifecycle-Plan.md) — Phase 1-2 (مكتمل)
- [Dashboard-Action-Plan.md](Dashboard-Action-Plan.md) — Dashboard rebuild plan
- [CLAUDE.md](CLAUDE.md) — Live test observations log

---

## ✅ Done

(Phase 1-2 موثّق في URL-Lifecycle-Plan.md)
