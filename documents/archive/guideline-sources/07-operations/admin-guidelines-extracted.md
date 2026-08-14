# Admin Guidelines — Operational Content (Extracted)

> **Source of source:** `admin/app/(public)/guidelines/page.tsx` + 9 sub-page files
> **Extracted on:** 2026-05-01
> **Why extracted here:** the live admin guidelines pages are themselves a primary source — they contain operational rules (designer specs, SEO writer rules, prohibitions, tool list) maintained by the team and updated as the product evolves. This MD captures their content for synthesis traceability.
>
> **Live URL:** `admin.modonty.com/guidelines/*` (already public, no auth)

---

## Designer Rules — Image Specs (canonical)

| النوع | المقاس | الملاحظة |
|---|---|---|
| الصورة الرئيسية للمقال | 1920 × 1080 | نسبة 16:9 بالضبط |
| لوجو العميل | 500 × 500 | مربع + PNG بخلفية شفافة |
| غلاف صفحة العميل | 2400 × 400 | بنر عريض 6:1 |
| صور البطاقات والمعرض | 1200 × 675 | نسبة 16:9 |
| صورة الكاتب | 500 × 500 | مربع 1:1 — الوجه في المنتصف دائماً |

---

## Content Writer — SEO Rules (3 Steps + Links)

### الخطوة 1 — Basic: العنوان والملخص والرابط

| الحقل | DO | DON'T |
|---|---|---|
| **Title** | بين 50 و 60 حرف — الكلمة المفتاحية في البداية. النظام يعرض عداد الحروف مباشرة | لا "مقال جديد" ولا تكرار العنوان عبر مقالين |
| **Excerpt** | بين 140 و 160 حرف — يظهر في بطاقات المقالات والقوائم | لا تتركه فارغاً — الفارغ يُعرض اسم العميل فقط |
| **Slug** | يتولّد تلقائياً — راجعه (إنجليزي + كلمات مفتاحية) | لا تواريخ، لا أرقام عشوائية، لا عربي |

### الخطوة 2 — Content: المحتوى

| القاعدة | DO | DON'T |
|---|---|---|
| **H2 / H3** | استخدم أزرار H2 و H3 — قسّم بعناوين واضحة، كلمات مفتاحية فيها | لا تكتب كتلة نص واحدة — يضر القراءة وSEO |
| **الكلمة المفتاحية** | في أول 100 كلمة + تتكرر طبيعياً | لا تكرار مصطنع — جوجل يعاقب على keyword stuffing |
| **طول المقال** | 800 كلمة حد أدنى — 1500+ للتنافسي. فقرات 3-5 أسطر | أقل من 500 كلمة نادراً تظهر في الصفحة الأولى |

### الخطوة 3 — SEO: حقول جوجل

| الحقل | DO | DON'T |
|---|---|---|
| **SEO Title** | 50-60 حرف — يختلف عن عنوان المقال | لا تتركه فارغاً — جوجل يستخدم العنوان وقد لا يكون مثالياً |
| **SEO Description** | 140-160 حرف — جملة تشويقية للنقر | لا تنسخ الـ Excerpt — اكتب وصفاً مخصصاً لجوجل |
| **SEO Keywords** | كلمة رئيسية أولاً + 3-5 ثانوية مرتبطة | لا 20+ كلمة عامة — 3-5 محددة أفضل |

### الروابط والصور

| القاعدة | DO | DON'T |
|---|---|---|
| **روابط داخلية** | 2-3 لمقالات أخرى داخل الموقع | لا تنشر بدون أي رابط داخلي |
| **Alt Text** | وصف حقيقي يتضمن الكلمة المفتاحية | لا تترك فارغاً ولا تكتب "صورة" |
| **قبل النشر** | نقطة SEO ≥ 60% (راجع SEO HEALTH) | لا تنشر بنقطة <60% — النظام يمنع |

---

## SEO Specialist — 3 Pillars

### Pillar 1 — Technical SEO (البنية التقنية)
**Responsibility:** النظام يتولاه، أنت تراجعه.

#### ما يولّده النظام (لا تكرره)
- **Schema Markup (JSON-LD):** Article + Person (الكاتب) + Organization (العميل) — لا تضف Schema يدوياً، الكود يتكرر
- **Canonical + OG Image + Sitemap:** يُولّدون من الـ Slug. لا تعدّلهم يدوياً
- **Settings Cascade:** إعدادات الموقع (الاسم، الوصف، الشعار) تنعكس تلقائياً على كل الكيانات

#### الإندكس والكانونيكال — الأخطاء الصامتة القاتلة
| الخطأ | ماذا يحدث |
|---|---|
| Canonical + noindex على نفس الصفحة | تعارض — جوجل يتجاهل الصفحة كلياً |
| Canonical إلى صفحة redirect أو محذوفة | الصفحة تفقد كل سلطتها |
| تعارض www vs non-www / HTTP vs HTTPS | جوجل يعتبر الموقعين منفصلين |
| Noindex في Sitemap | تعارض صريح — يُهدر Crawl Budget |
| Orphan Pages (صفحات بلا روابط) | جوجل لا يكتشفها حتى لو في Sitemap |
| Duplicate Content بدون canonical | جوجل يُضعف الاثنتين |

#### الكيانات — E-E-A-T
- **الكتّاب (Person):** الاسم الكامل + السيرة + الصورة + روابط التواصل
- **العملاء (Organization):** الاسم + الوصف + الموقع + الشعار + القطاع
- **الفئات والوسوم:** اختر بكلمات مفتاحية ذات حجم بحث فعلي

### Pillar 2 — On-Page SEO (تحسين الصفحة)
**Responsibility:** شغلك المباشر في الأدمن.

#### الخطوة 0 — بحث الكلمات المفتاحية قبل أي شيء
- **KD% (Keyword Difficulty):** Semrush مقياس: 0-14 سهل جداً · 15-29 سهل · 30-49 ممكن · 50+ صعب
- **موقع جديد:** ابدأ بـ KD < 30
- **⚠️ تحذير رسمي من جوجل:** عمود "Competition" في Keyword Planner للإعلانات فقط، **ليس** لصعوبة الترتيب العضوي
- **أدوات KD الحقيقية:** Semrush · Ahrefs · Mangools/KWFinder · Rank Tracker

#### حقول SEO الأساسية (تكملة)
- **SEO Title:** صيغة `[الكلمة المفتاحية] | مدونتي` — 50-60 حرف
- **SEO Description:** بحسب نية البحث (معلوماتي / تجاري / نقل) + CTA واضح، 140-160 حرف
- **Keywords:** كلمة رئيسية + 2-4 LSI ثانوية (لا أكثر من 7)

#### المحتوى والروابط الداخلية
- **هيكل:** H2/H3 بكلمات مفتاحية + الكلمة الرئيسية في أول 100 كلمة + 800+ كلمة
- **Internal Links:** 2-4 روابط داخلية لكل مقال + Anchor Text وصفي
- **بوابة النشر:** SEO HEALTH ≥ 60%

### Pillar 3 — Off-Page SEO (السلطة الخارجية)
**Responsibility:** خارج الأدمن — استراتيجية خارجية.

#### Backlinks
- **الجودة قبل الكمية:** رابط من موقع ذو صلة عالي السلطة = 100 رابط ضعيف
- **Guest Posting:** rel="nofollow" أو rel="sponsored" مطلوبين قانونياً
- **Brand Mentions:** تتبّع عبر Google Alerts
- **Disavow Tool:** فقط مع Manual Penalty رسمي من GSC. الاستخدام العشوائي يضر

#### المراقبة والقياس
- **GSC أسبوعياً:** الكلمات الجديدة + CTR + متوسط الترتيب + Core Web Vitals
- **Quick Wins:** كلمات في الترتيب 4-15 (Position Report)
- **التقرير الشهري:** GSC + Analytics معاً (Organic Traffic + Avg. Position + CTR + Bounce Rate)

---

## SEO Tools — Categorized

### مجانية (أساسية)
- **Google Search Console** — مراقبة ترتيب + CTR + أخطاء الفهرسة + Sitemap + Manual Penalties + Core Web Vitals
- **Google Analytics 4** — تحليل الزوار + المصادر + الصفحات الأكثر زيارة
- **Google Trends** — اتجاهات البحث الموسمية
- **Google Alerts** — تتبّع Brand Mentions
- **Google PageSpeed Insights** — Core Web Vitals
- **Google Rich Results Test** — التحقق من JSON-LD
- **Google Keyword Planner** — حجم البحث الشهري فقط (⚠️ Competition للإعلانات فقط)

### مدفوعة (All-in-One)
- **Semrush** — الأشمل: KD% + Backlinks + Site Audit + Rank Tracking
- **Ahrefs** — أقوى لـ Backlinks + Content Gap Analysis
- **SE Ranking** — بديل أرخص

### تحسين المحتوى
- **Surfer SEO** — يحلل المتصدرين ويعطيك تقرير: كم كلمة، أي H2/H3
- **Clearscope** — Surfer للفرق الكبيرة (Adobe, IBM)
- **Frase** — يولّد Content Briefs + يدعم GEO
- **Majestic** — Backlinks: Trust Flow + Citation Flow

### بناء الروابط
- **Hunter.io** — يجد إيميلات أصحاب المواقع
- **BuzzStream** — CRM لبناء الروابط ($24/شهر)
- **Pitchbox** — متكامل ($195/شهر)

### AI & GEO (مستقبل 2025/2026)
- **Frase — GEO Mode** — تحسين للظهور في ChatGPT + Perplexity + Google AI Overviews
- **SE Ranking — AI Visibility** — يتتبع AI Overviews (16%+ من البحث)
- **Profound** — قياس ظهور علامتك في ChatGPT + Claude + Perplexity + Gemini

---

## SEO Prohibitions — Categorized by Severity

### 🚨 Critical (خطر فوري)

#### تقني — يُعطّل الفهرسة
- Canonical + noindex على نفس الصفحة → جوجل يتجاهل الصفحة
- Robots.txt يحجب صفحات مهمة → الصفحة تختفي
- Slug يتغير على مقال منشور بدون redirect → URL يصبح 404

#### محتوى
- Keyword Stuffing → عقوبة Spam مباشرة
- Scraping (نسخ من المواقع الأخرى) → عقوبة Spam
- Scaled Content Abuse (إنتاج جماعي بدون قيمة) → سياسة 2024/2025

#### روابط — Penguin
- شراء/بيع الروابط → عقوبة فورية
- تبادل دائري مصطنع (A→B→A) → link spam violation
- Guest Post بدون nofollow/sponsored → مخالفة صريحة
- PBN (شبكات المواقع الخاصة) → حذف من الفهرس
- Parasite SEO → سياسة Site Reputation Abuse 2024
- Expired Domain Abuse → سياسة Spam رسمية 2024

#### Manual Penalties
- Cloaking (محتوى مختلف لجوجل وللمستخدم) → حذف فوري
- Hidden Text/Links → manual penalty
- Doorway Pages → عقوبة مباشرة
- Sneaky Redirects → حذف من الفهرس
- Hacked Content → "Dangerous" warning في GSC
- Scam/Fraud → manual action فوري
- Policy Circumvention → جوجل يربط الأنماط
- Machine-Generated Traffic → حظر IP

### 🟠 High (يخفض الترتيب)

#### تقني
- Canonical إلى redirect/محذوفة → الصفحة تفقد سلطتها
- Noindex في Sitemap → يُهدر Crawl Budget
- Orphan Pages → Googlebot لا يصلها
- LCP > 2.5 ثانية → Core Web Vitals تفشل
- CLS > 0.1 → Core Web Vitals تفشل
- www vs non-www بدون توحيد → موقعين منفصلين
- URL Parameter Explosion → آلاف URLs مكررة
- حجب CSS/JS عن Googlebot → جوجل لا يفهم الصفحة

#### محتوى
- Thin Content (<300 كلمة) → Panda algorithm penalty
- Duplicate Content بدون canonical → جوجل يضعف الاثنتين
- AI Content بدون مراجعة بشرية → سياسة 2024
- محتوى لا يطابق نية البحث → Bounce Rate يرتفع
- Thin Affiliation → سياسة Spam رسمية
- User-Generated Spam → جوجل يعاقب الموقع المضيف

#### On-Page
- صفحتان بنفس SEO Title → Keyword Cannibalization
- صفحة بدون H1 واضح → بنية ضعيفة
- Intrusive Interstitials (Pop-ups على موبايل) → Google demotion
- Non-Mobile-Friendly → Mobile-first Indexing فاشل
- INP > 200ms → Core Web Vitals (replaced FID 2024)

### 🟡 Medium (يضعف الموقع)

- نفس Meta Description في كل الصفحات → جوجل يتجاهلها
- Alt Text فارغ → 55% من المواقع تخطئ هنا
- روابط داخلية مكسورة (404)
- Bounce Rate عالي + جلسات قصيرة → إشارة سلبية تدريجية

---

## Sub-Pages Coverage (admin/.../guidelines/*)

The admin guidelines folder has 9 deep sub-pages:

| Sub-page | Purpose |
|---|---|
| `/guidelines/articles` | Full article creation flow + SEO checklist + content fields |
| `/guidelines/authors` | Author profile setup + credentials + linking to articles |
| `/guidelines/clients` | Client setup + branding + commercial info + business linking |
| `/guidelines/media` | Image specs (full version of designer rules) + previews |
| `/guidelines/media/article-preview` | How article featured image renders |
| `/guidelines/media/client-preview` | How client logo + hero render |
| `/guidelines/media/postcard-preview` | Social card preview |
| `/guidelines/organization` | Categories, tags, industries — content organization |
| `/guidelines/seo-visual` | Visual SEO course — SERP, Rich Results, OG Image, Social Share |
| `/guidelines/subscribers` | Subscriber management + privacy policy |
| `/guidelines/tracking` | GTM + Analytics setup + reading data |

These are **canonical operational references** — Phase 4 should integrate these (not duplicate them) into the unified Knowledge Hub.

---

## Section Cards on `/guidelines` Landing

Color-coded section grid with these IDs:
- `media` (blue) — Media & Image Standards
- `articles` (emerald) — Articles
- `authors` (violet) — Authors
- `clients` (orange) — Clients
- `organization` (indigo) — Content Organization
- `subscribers` (teal) — Subscribers
- `tracking` (amber) — Tracking & Performance
- `seo-visual` (sky) — Visual SEO Course

---

## Source Reference

Primary file: [`admin/app/(public)/guidelines/page.tsx`](../../../../admin/app/(public)/guidelines/page.tsx) — 1224 lines containing:
- `designerRules[]` (5 image specs)
- `seoSections[]` (3 main blocks: Basic, Content, SEO)
- `seoPillars[]` (3 pillars: Technical, On-Page, Off-Page) with Pillar.sections + nested rules
- `seoTools[]` (5 categories: Free, Paid All-in-One, Content Optimization, Link Building, AI/GEO)
- `seoProhibitions[]` (6 categories with severity-coded items)
- `guidelineSections[]` (9 sub-page cards)

Sub-pages:
- `articles/page.tsx`
- `authors/page.tsx`
- `clients/page.tsx`
- `media/page.tsx` + 3 preview pages
- `organization/page.tsx`
- `seo-visual/page.tsx`
- `subscribers/page.tsx`
- `tracking/page.tsx`

Shared: `components/guideline-layout.tsx` (used by all sub-pages)
