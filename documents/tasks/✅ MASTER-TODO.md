# MASTER TODO — MODONTY

> **آخر تحديث:** 2026-05-04 (Session 81 — Quality Gate · Google-strict audit · v0.51.x indexing tracking + GSC deep-link cleanup · **v0.52.0 + modonty v1.43.1**: removed image-sitemap (cross-domain Cloudinary URLs caused 48/48 GSC errors — verified safe per 3 official Google docs: page crawl + JSON-LD already cover image discovery) · ACTION: remove sitemap manually from GSC after deploy · NEXT SESSION: "SEO Data Health" section)
> **الإصدار الحالي:** admin v0.52.0 · modonty v1.43.1 · console v0.5.0
> **المهام المنجزة** → [🏆 MASTER-DONE.md](🏆%20MASTER-DONE.md)
> **مهام Low-priority** → [💡 NICE-TO-HAVE.md](💡%20NICE-TO-HAVE.md)

### روابط الخطط

- 🆕 **[JBRSEO Integration Plan](JBRSEO-INTEGRATION-PLAN.md)** — Mirror + Sync (Pricing + Leads). يلغي PRC-01 ويستبدله. 5 phases · 8 questions pending
- [Perfect-SEO-Plan](Perfect-SEO-Plan.md) — 108 مهمة عبر 13 phase
- [Dashboard Action Plan](Dashboard-Action-Plan.md)
- [URL Lifecycle Plan](URL-Lifecycle-Plan.md)

---

## 🔴 1. PRC-01 — Pricing integration **[SUPERSEDED → JBRSEO-INTEGRATION-PLAN.md]**

> ⚠️ **ملغية في Session 76 (2026-05-02):** الـ approach الأصلي (REST API من jbrseo) استُبدل بـ **Mirror + Sync** pattern.
> الخطة الجديدة + leads sync مدمجين في ملف واحد: [JBRSEO-INTEGRATION-PLAN.md](JBRSEO-INTEGRATION-PLAN.md)
> النقاط أدناه محفوظة كمرجع تاريخي للسياق فقط.

---

### PRC-01 (الأرشيف) — Pricing/features integration: jabrseo.com → modonty

**Priority:** URGENT (السعر هاردكود مكرر في 5+ صفحات guideline + خطأ شائع: 1,299 شهري ↔ سنوي)

### الخلفية

- المصدر القديم (SYNTHESIS.md) قال «السعر/سنة» — خالد أكّد إنه شهري
- الموقع الحي عنده tiers مختلفة: Basic 2,499 · Standard 3,999 · Pro 6,999 · Premium 9,999
- لا أحد يدري الأسعار الحقيقية بدقة بدون مصدر موحّد

### الصفحات المتأثرة (تحتاج تحديث بعد PRC-01)

| الصفحة | الخطأ |
|--------|------|
| `admin/guidelines/clients/page.tsx` | tiers محدّدة بدون أسعار |
| `admin/guidelines/golden-rules/page.tsx` Rule 5 | جدول WordPress fix — 1,299/15,588 hardcoded |
| `admin/guidelines/golden-rules/page.tsx` Rule 11 | ROI Pitch بسياق سنوي غلط |
| `admin/guidelines/golden-rules/page.tsx` Rule 12 | جدول الباقات بدون توضيح month/year |
| `admin/guidelines/sales-playbook/page.tsx` | Elevator Pitch «1,299 ريال للسنة كاملة» — غلط |
| `admin/guidelines/about/page.tsx` | Hero يذكر «90% توفير» — يحتاج reality-check |
| `admin/guidelines/marketing-strategy/page.tsx` | KPIs تسعير يحتاج audit |
| `console/dashboard/settings/subscription-card.tsx` | يقرأ من DB حالياً |

### المقترح المعتمد (Option A — REST API)

1. **jabrseo.com:** `app/api/pricing/route.ts` — يرجع JSON بـ:
   ```ts
   {
     tiers: [
       { tier: "BASIC", articlesPerMonth: 2, monthly: 2499, yearly: 24990, currency: "SAR", features: [...], benefits: [...] },
       { tier: "STANDARD", ... },
       { tier: "PRO", ..., popular: true },
       { tier: "PREMIUM", ... }
     ],
     rules: { "twelveEqualsEighteen": true },
     updatedAt: ISO
   }
   ```
2. **modonty (admin):** `lib/pricing/fetch-pricing.ts` — server function مع `unstable_cache` (TTL ساعة) + DEFAULT_PRICING fallback
3. **modonty (console):** نفس lib + استخدام في settings page + upgrade prompts
4. **Webhook لاحقاً:** `revalidateTag("pricing")` لو احتجنا real-time invalidation

### أسئلة معلَّقة (تحتاج إجابة قبل التنفيذ)

1. الأسعار + المزايا الحالية موجودة في jabrseo DB؟ أو نبتدي من الصفر؟
2. Endpoint عام (read-only) أو نضيف API key للحماية؟
3. هل فيه مواقع تانية غير modonty تستهلك نفس البيانات؟
4. monthly + yearly كلاهما، أو monthly فقط مع حساب yearly = ×12؟
5. تطبيق قاعدة 12=18 يحصل في jabrseo أو modonty side؟

### Files to create/modify

- jabrseo.com — `app/api/pricing/route.ts` (جديد)
- modonty/admin — `lib/pricing/fetch-pricing.ts` (جديد) + 7 ملفات guideline (تعديل)
- modonty/console — `lib/pricing/fetch-pricing.ts` (mirror) + `subscription-card.tsx` (تعديل)
- **Test:** أي تعديل سعر في jabrseo → يظهر في كل المواضع خلال ساعة (max cache TTL)

---

## 🟡 2. COMP-INTEL-01 — Competitive Intelligence MVP في console

**Priority:** بعد PRC-01 (نفس الـ pattern — fetch خارجي + cache + display. PRC-01 أولاً يعلّمنا الأسلوب)

### Phase 1 — MVP (~2 weeks)

- Prisma model: `Competitor` (clientId · domain · keywords · lastFetched)
- صفحة جديدة: `console/dashboard/competitors`
- Server action: `addCompetitor` + `fetchCompetitorData`
- DataForSEO API integration: `lib/competitors/dataforseo.ts`
- Weekly cron job
- Dashboard tab يعرض: shared keywords + gaps

### Phase 2 (~2-3 weeks)

- Search intent classification
- Content gap suggestions
- Visual charts (bars, pie)

### Phase 3 (~2 weeks)

- Weekly PDF reports
- Telegram alerts (منافس نشر مقال جديد)
- Free Audit endpoint للـ Discovery Calls

### Economics

- DataForSEO: $50–100/شهر base · SerpAPI: $50–100/شهر
- إجمالي: ~$150/شهر = ~563 ريال
- لـ 100 عميل: $1.50/عميل/شهر · margin ~96% ضد Momentum 1,299 شهري

### القيمة الاستراتيجية

- تمايز فريد (لا منافسة عربية صغيرة عندها هذا)
- يبرر upsell لـ Pro/Premium
- Free Audit = أقوى Closing Tool في الـ Discovery Call
- يصدّق وعد القاعدة 7 (القوة 4 — عيون على المنافسين)

### Files to create

- console — Prisma `Competitor` model
- console — `app/(dashboard)/dashboard/competitors/page.tsx`
- console — `lib/competitors/dataforseo.ts`
- console — `app/(dashboard)/dashboard/competitors/actions/competitor-actions.ts`
- console — `lib/cron/fetch-competitor-data.ts`
- admin/guidelines/golden-rules — تحديث القاعدة 7 القوة 4 (إزالة self-gap warning بعد التنفيذ)

---

## 🟡 3. T1.3-REV — Reviewer Field (Person reviews medical articles for E-E-A-T)

**Priority:** Medium — يحتاج outreach لطبيب مرخّص قبل ما code يفيد · مرجع كامل في [ARTICLE-SCHEMA-PERFECTION-TODO.md#T1.3](ARTICLE-SCHEMA-PERFECTION-TODO.md)

### الخلفية

modonty = dental + healthcare platform → YMYL (Your Money Your Life) content. Google E-E-A-T يفضّل بشدة المحتوى المُراجَع من خبير. Schema.org `reviewedBy` + Person node = boost في الـ trust scoring.

### Blocker الحقيقي

❌ **مش مشكلة code** — مشكلة **operations/شراكات**: modonty ما عنده طبيب مراجع حالياً.

### Code work (سهل · ~30-45 دقيقة لما نوصلها)

- [ ] إضافة `isReviewer Boolean @default(false)` لـ Author model في schema.prisma
- [ ] إضافة `reviewedById String? @db.ObjectId` + relation `reviewer Author?` لـ Article model
- [ ] Admin article editor: dropdown "Reviewed by" يفلتر `isReviewer=true` فقط
- [ ] Author dropdown يفلتر `isReviewer=false` (يبقى Modonty فقط)
- [ ] `admin/lib/seo/knowledge-graph-generator.ts` — إضافة `reviewedBy` Person node لو الـ `reviewedById` موجود
- [ ] modonty article header: عرض "كَتبه: Modonty · ✓ راجَعه: د. X"

### Operations work (Blocker)

- [ ] **اختر approach** — paid Medical Editor part-time (3-6K/شهر) · per-article reviewer (150-400/مقال) · co-credit + LinkedIn outreach (مجاني — author bio + backlink)
- [ ] **outreach 3 أطباء أسنان عرب** عبر LinkedIn (search: dental surgeon Riyadh/Cairo) — استهداف assistants/junior في بداية مسارهم الرقمي
- [ ] أول طبيب يوافق → نضيف Author row بـ `isReviewer=true` + jobTitle + sameAs (LinkedIn URL)
- [ ] بعدها → ننفّذ الـ code work + live test على مقال طبي

### Why deferred

- ❌ ما نضيف feature بدون data تملاها → JSON-LD يطلع `reviewedBy: null` في كل مقال
- ❌ ما نخدع Google بـ reviewer وهمي → E-E-A-T penalty لو اكتشف
- ✅ Code work ينستنى لما يكون عندنا أول reviewer real

---

## 🟡 4. KH-AUDIT-01 — Add client page selling point في 5 guideline pages

**Priority:** ضمن Knowledge Hub review الكامل بعد PRC-01

### الفجوة المكتشفة

صفحة العميل على modonty.com (modonty.com/clients/[slug]) **أصل تسويقي ضخم** فاتت من معظم الـ guidelines.

### ما تحويه الصفحة فعلياً

- **8 tabs:** الكل · حول · تواصل · الصور · المتابعون · التقييمات · الريلز · الإعجابات
- **Hero:** شعار العميل + غلاف + اسم + tagline
- **Article list:** كل مقالات العميل في مكان واحد
- **Social proof:** followers · reviews · likes · photos · mentions
- **Visitor actions:** follow · favorite · comment · share · review · contact
- **Newsletter signup card** (lead capture) + Mobile CTA + View tracker

### القيمة التسويقية

1. Mini-website جاهز بدون تكلفة موقع منفصل
2. Social presence مدمج (followers · reviews) بدون أدوات خارجية
3. Domain Authority benefit (subpage على modonty.com)
4. Discovery channels (tags · categories · search)
5. Lead capture كامل (newsletter + contact + comment)
6. Analytics مدمجة

### Pages to update

| الصفحة | الإضافة المطلوبة |
|--------|------------------|
| `about/page.tsx` | بند جديد في «ما يحصل العميل» — «صفحة كاملة على modonty.com بـ 8 tabs» |
| `golden-rules` Power 3 (social proof) | إضافة: «النظام مدمج في صفحة العميل — followers + reviews + ratings» |
| `sales-playbook` | نقطة بيعية: «احنا نطلّع لك صفحة احترافية — مش بس مقالات» |
| `clients/page.tsx` | موجود لكن غير مفصّل — يحتاج expansion |
| `icps/page.tsx` | كل ICP يستفيد بطريقة (التجارة → كتالوج، العيادات → reviews، المحاماة → mentions) |

### التطبيق المقترح

- audit كل صفحة من الـ 5
- إضافة البند بـ formatting موحّد (icon + headline + 3-5 bullets)
- screenshot من صفحة عميل حقيقي (مثل kimazone) كـ proof

---

## 📊 4. Admin Analytics Page — Coverage Gaps

> **Audit date:** 2026-05-01 · مصدر البيانات الحالي: MongoDB `Analytics` collection (in-house — مش Google Analytics).

### ANL-01 🟡 MEDIUM — Page-type coverage gap (only article views tracked)

- **Issue:** التقرير يعرض **مشاهدات المقالات فقط**. زوار `/`, `/categories`, `/tags`, `/authors`, `/clients`, `/industries` غير مرئيين. تحت-تقدير الـ reach بنسبة 30-50% محتمل.
- **Why:** `db.analytics.create()` يُستدعى في مكان واحد فقط — article view route
- **Fix:** generic page-view tracker (middleware + tracker component) → `/api/track/page-view` مع pageType + slug
- **Decision pending:** نضيف `pageType` للموديل الحالي `Analytics`، أو ننشئ موديل `PageView` منفصل؟

### ANL-02 🟡 MEDIUM — UI filter for client/article missing

- **Issue:** الـ server action `getAnalyticsData()` يقبل `{ clientId, articleId, startDate, endDate }` — لكن الـ UI يكشف نطاق التاريخ فقط
- **Effect:** الأدمن ما يقدر يفلتر "Kimazone-only" أو "article X" من غير ما يكتب كود
- **Fix:** dropdown للعميل + dropdown للمقال (scoped للعميل المختار) → wire للـ filter state الموجود

### ANL-03 🟡 MEDIUM — `categorizeSource()` is too coarse for 2026 traffic patterns

- **Current:** Direct / Organic / Social / Paid / Email / Referral (6 buckets)
- **Modern blind spots:**
  - ❌ Google Discover (يصنّف مختلف عن Google Search)
  - ❌ AI search referrers (ChatGPT, Perplexity, Claude, Gemini, You.com)
  - ❌ UTM tracking (utm_source/utm_medium/utm_campaign)
  - ❌ Internal navigation (modonty.com → modonty.com يُعدّ Direct)
- **Fix:** extend categorizer + capture utm_* params + buckets `AI Search` / `Discover` / `Internal`
- **File:** [admin/.../get-analytics-data.ts:33](admin/app/(dashboard)/analytics/actions/get-analytics-data.ts#L33)

### ANL-04 🟡 MEDIUM — Date range presets + period comparison

- **Issue:** date picker يدوي فقط — مفيش "Last 7d / 30d / 90d / This year"
- **Issue:** ما فيه comparison data ("Views this week vs last week — +17%"). الـ Dashboard يعرضها — analytics page لأ
- **Fix:** preset chips + compute previous-period delta in `getAnalyticsData()`

### ANL-05 🟢 LOW — Captured but not displayed: Core Web Vitals (LCP/CLS/INP)

- **Captured:** `Analytics.lcp` / `Analytics.cls` / `Analytics.inp` (RUM من زوار حقيقيين)
- **Displayed:** nowhere — wasted data
- **Fix:** widget يعرض p75 لكل مقال (مطابق للـ Google Core Web Vitals report style)

### ANL-06 🟢 LOW — Captured but not displayed: device + geo breakdowns

- **Captured:** `userAgent` + `ipAddress` لكل سجل
- **Displayed:** ولا واحد
- **Fix:**
  - Device split (mobile/tablet/desktop) — parse userAgent (موجود في console analytics — port the helper)
  - Geo (country / city) — call ip-api.com (مدمج في `modonty/lib/telegram/geo.ts`); cache per-IP per-day
- قيمة استراتيجية كبيرة لـ ad-targeting + content localization

### ANL-07 🟢 LOW — New vs Returning visitors split

- **Possible from existing data:** sessionId count per visitor over rolling window
- **Currently:** مش معروض
- **Fix:** group by sessionId, label as "returning" if >1 session in last 30d
- نفس المنطق موجود في console analytics deep-dive — port it

### ANL-08 🟢 LOW — Conversion tracking exists in DB but not on this page

- **Observation:** `Conversion` model + `lib/conversion-tracking.ts` موجودين ويُطلقون عبر modonty (subscribers, contact, news, register). Console dashboard يستخدمهم. Admin `/analytics` لأ
- **Fix:** "Conversions in window" KPI + breakdown by conversion type

### ANL-09 🟢 LOW — Hardcoded read limits could miss data

- `take: 10000` in `getAnalyticsData()` و `take: 50000` in `getViewsTrendData()`
- مقبول الآن (low traffic) لكن قنبلة موقوتة على scale
- **Fix:** MongoDB aggregation pipelines (`$group` server-side) للـ KPIs بدل سحب rows لـ JS

### ANL-10 🟢 LOW — `bounced` definition is unclear (doc-rot risk)

- **Issue:** الحقل يُضبط من client-side tracker، لكن قاعدة "bounced" مش موثّقة في أي مكان
- **Fix:** document the rule next to the schema + tooltip على bounce-rate KPI

---

## 🟢 5. SCHEMA-T2 — Article Schema Tier 2 (deferred — low ROI)

**Priority:** Low — يُرجَع لها بعد monitoring Search Console post-Tier-1-push (2-4 أسابيع)

### السياق

Tier 1 من ARTICLE-SCHEMA-PERFECTION-TODO خلصت بـ ~80% من فائدة schema الممكنة. Tier 2 هي الـ 20% الباقية، **موزّعة على tasks ضعيفة الـ ROI** لمدونتي حالياً.

### Tier 2 tasks (deferred)

- **T2.1 — Speakable Schema (Voice Assistants)** 🔴 ROI ~0%
  - Google **deprecated** Speakable في 2023. Voice Assistant market صغير في العالم العربي.
  - Schema.org `speakable` — auto-detect summary + first paragraph

- **T2.2 — VideoObject Embedded في المقالات** 🟡 ROI 5-10%
  - Schema.org VideoObject — يخدم Google Video rich result
  - Parser للـ content يستخرج YouTube/Vimeo links + يضيف VideoObject في @graph
  - **شرط:** يفيد فقط لو في مقالات تحتوي فيديو فعلاً

- **T2.3 — isBasedOn (مختلف عن citation)** 🟡 ROI 2-5%
  - Schema.org `isBasedOn` — للمقالات المبنية على press release / research paper
  - حقل اختياري في SEO tab — "هذا المقال مبني على" (URL + name)
  - يحتاج مصادر بحثية حقيقية

- **T2.4 — interactionStatistic (Likes/Shares/Comments)** 🔴 ROI ~0%
  - Schema.org `interactionStatistic` + InteractionCounter
  - **Google ما يعرضها** في rich results — مجرد metadata
  - الـ generator يضيف array من InteractionCounter لكل نوع

- **T2.5 — Featured Articles Section على Homepage** 🟡 UX (مش SEO)
  - Component يستهلك `getFeaturedArticles()` ويعرض carousel/hero في homepage modonty
  - مرجع: [modonty/app/api/articles/featured/route.ts](../../modonty/app/api/articles/featured/route.ts) موجود جاهز

### Tier 3 — Nice-to-have (deferred too)

- **T3.1** — `hasPart` لتقسيم المقالات الطويلة لفصول قابلة للـ deep-link
- **T3.2** — `proficiencyLevel` / `educationalLevel` للـ tutorials و courses
- **T3.3** — Multi-author UI (الكود يدعم authors[]، الـ UI single)
- **T3.4** — WebPage wrapper ينلف Article في @graph: `WebPage > about > Article`
- **T3.5** — `dateCreated` (مختلف عن datePublished) — متى بدأت المسودة
- **T3.6** — Custom CTA Box per article (Conversion-focused)
- **T3.7** — Pull Quotes قابلة للمشاركة على Twitter/LinkedIn
- **T3.8** — Hreflang / Multi-language ربط نسخ المقال عبر اللغات

### قرار التنفيذ (post-validation)

- Push Tier 1 → wait 2-4 weeks → check Search Console:
  - لو في improvement واضح → الـ approach صح، نختار **T2.2 + T2.3 selective** بناءً على نوع المحتوى
  - لو ما في → الـ bottleneck = content quality، نشتغل عليه بدل الـ schema

---

## 🧹 6. CLEAN-01 — Atlas password rotation (معلّقة)

**Priority:** متى ما تجهز

### الحالة

- [x] حُذف `test-prisma-connection.ts` من الـ working tree (2026-04-29)
- [ ] ⚠️ لا يزال في git history (commit `493d4e5`) — قرار المستخدم: تأجيل لحين تغيير Atlas account
- [ ] **معلّق:** غيّر MongoDB Atlas password متى ما تجهز + حدّث 3 ملفات `.env.local` + Vercel envs

> التقرير الكامل: [REPO-CLEANUP-AUDIT.md](../audits/REPO-CLEANUP-AUDIT.md)

---

## ✅ المهام المنجزة في الجلسات الأخيرة

نُقلت إلى [🏆 MASTER-DONE.md](🏆%20MASTER-DONE.md):

- **Session 80 (2026-05-03):** Article Schema Tier 1 done (T1.1+T1.2+T1.5+T1.6+T1.7+T1.8) · Modonty Org author + multi aspect ratios + cascade unified + live UI banner · guideline addition (Publisher Authority Transfer) · **SIDEBAR-ACCORDION** (admin sidebar one-group-at-a-time behavior) · **SEED-DISTRIBUTION** (integration test seed: 24 articles across all 7 statuses) · **WORKFLOW-SEO-HEALTH** (per-row SEO badge + dialog on workflow pages — DB-mirror of Search Console pipeline checks · `validateArticleFromDb()` shares same check IDs/labels/severity as `validateArticle()` · pre-publish checks · admin/lib/seo/article-validator-db.ts) · padding fix on workflow `[transition]/page.tsx` · **QUALITY-GATE** (28-check comprehensive pre-publish validator across 8 groups: indexability/content/author+publisher/images/internal-links/JSON-LD/technical/dates · researched from Google Search Central + Schema.org Article spec + Next.js metadata API via Context7 · auto-fix layer regenerates stale JSON-LD before validation · hard gate blocks DRAFT→AWAITING_APPROVAL when ANY check fails — NO OVERRIDES · `gatedTransitionAction` · validation results shown on dedicated page `/articles/workflow/quality-check/[id]` instead of dialog — full-screen review · summary banner + article info strip + issues cards with How-to-fix + smart links to article editor tab (SEO/Content/Media/Basic) per check · ReRunButton + SendToClientButton (disabled when failed) · live tested on 4 DRAFT articles all blocked with 22-24/28 scores · zero TS errors)
- **Session 76 (2026-04-30/05-01/05-02):** RWN-01..04 (Rawan bugs · userVersion locking) · TOAST-01 (admin toast UX) · Knowledge Hub Phase 5 (15 صفحات guideline · 22 قاعدة ذهبية · pricing fixes · «محركات البحث» · «عالمي/غربي» · Sidebar 3 groups · Hadith cultural anchor) · admin v0.47.0 push
- **Session 73 (2026-04-29):** CLEAN-02..07 (Build cache · test artifacts · backups · scripts archive · documents/_archive deleted · root configs)
- **Session 68-69 (2026-04-26):** SC-UI-01..04 (Search Console UI enhancements · Sitemap drill-down dialog · Indexing API removal dedup · bulk button removed · filter pills inside table)

> راجع MASTER-DONE.md للتفاصيل الكاملة + الملفات + النتائج.
