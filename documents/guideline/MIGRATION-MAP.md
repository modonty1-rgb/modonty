# Migration Map — Phase 3.5 (Audit Before Build)

> **هدف هذا الملف:** ضمان زيرو فقدان للبيانات لما ننتقل لـ Phase 4 (الـ Hub الجديد).
> **آخر تحديث:** 2026-05-01

---

## 1. Inventory — ما هو موجود فعلياً

### Pages (12 صفحة + layout component)

| الصفحة | الأسطر | الحجم | الجمهور | الجودة |
|---|---|---|---|---|
| `/guidelines` (landing) | 1224 | 74K | كل الأدوار | ⭐⭐⭐⭐⭐ ممتازة (محتوى دسم) |
| `/guidelines/seo-visual` | 575 | 38K | SEO Specialist + Content Writer | ⭐⭐⭐⭐ بصري قوي |
| `/guidelines/authors` | 431 | 21K | Admin operator | ⭐⭐⭐⭐ تشغيلي |
| `/guidelines/media/article-preview` | 412 | 18K | Designer | ⭐⭐⭐⭐ بصري |
| `/guidelines/organization` | 375 | 20K | Admin operator | ⭐⭐⭐⭐ تشغيلي |
| `/guidelines/articles` | 353 | 14K | Content Writer + Admin | ⭐⭐⭐⭐⭐ مرجع رئيسي |
| `/guidelines/media` | 320 | 16K | Designer | ⭐⭐⭐⭐⭐ مرجع تصميم |
| `/guidelines/media/client-preview` | 296 | 13K | Designer | ⭐⭐⭐⭐ بصري |
| `/guidelines/tracking` | 278 | 14K | SEO + Marketer | ⭐⭐⭐⭐ تقني |
| `/guidelines/clients` | 263 | 12K | Admin operator | ⭐⭐⭐⭐ تشغيلي |
| `/guidelines/subscribers` | 259 | 10K | Admin operator | ⭐⭐⭐⭐ تشغيلي |
| `/guidelines/media/postcard-preview` | 226 | 10K | Designer | ⭐⭐⭐⭐ بصري |
| `components/guideline-layout.tsx` | 37 | 1K | (shared) | ✅ يُعاد استخدامه |

### Data structures الموجودة في landing فقط (sourced via extracted MD)

- `designerRules[]` (5 image specs) — للمصممين
- `seoSections[]` (3 main blocks) — لكاتب المحتوى
- `seoPillars[]` (3 pillars × ≥3 sections each) — لمتخصص SEO
- `seoTools[]` (5 categories) — مرجع أدوات
- `seoProhibitions[]` (6 categories, 50+ items) — قائمة الممنوعات
- `guidelineSections[]` (9 cards) — روابط للـ sub-pages

---

## 2. Content Audit — صفحة-بصفحة

### 🟢 KEEP AS-IS (تبقى كما هي، نربط لها من الـ Hub الجديد)

#### `/guidelines/articles`
- **محتواها:** خطوات إنشاء مقال + حقول SEO + نصائح المحتوى الاحترافي
- **علاقتها بـ SYNTHESIS:** §15 (Content Writer SEO Rules) — تفصيلي أكثر
- **التوصية:** ✅ تبقى. الـ Hub الجديد يربط لها من قسم "كاتب المحتوى"

#### `/guidelines/authors`
- **محتواها:** نموذج الكاتب الموحد + E-E-A-T + ربط بالمقالات
- **علاقتها بـ SYNTHESIS:** §16 (E-E-A-T mention) — صفحة عملية أفصل
- **التوصية:** ✅ تبقى. الـ Hub الجديد يربط من قسم "العمليات"

#### `/guidelines/clients`
- **محتواها:** حقول العميل + SEO + الوسائط
- **علاقتها بـ SYNTHESIS:** ما عندها overlap — operational only
- **التوصية:** ✅ تبقى. ربط من "العمليات"

#### `/guidelines/media`
- **محتواها:** مقاسات الصور كاملة + previews + best practices
- **علاقتها بـ SYNTHESIS:** §14 (Designer Specs) — هذي تفصيل أعمق
- **التوصية:** ✅ تبقى — بل **هذي المرجع الأصلي**. SYNTHESIS §14 ملخّص فقط.

#### `/guidelines/media/article-preview` + `/client-preview` + `/postcard-preview`
- **محتواها:** معاينات بصرية تفاعلية لكيف تظهر الصور
- **علاقتها بـ SYNTHESIS:** ❌ ما تتكرر — visual only
- **التوصية:** ✅ تبقى. روابط من media صفحة

#### `/guidelines/organization`
- **محتواها:** الفئات + الوسوم + القطاعات (Content Organization)
- **علاقتها بـ SYNTHESIS:** §16 ركن Technical SEO يذكرها سطحياً
- **التوصية:** ✅ تبقى. ربط من قسم "العمليات"

#### `/guidelines/seo-visual`
- **محتواها:** دليل بصري — SERP / Rich Result / OG Image / Social Share
- **علاقتها بـ SYNTHESIS:** ❌ ما تتكرر — visual reference unique
- **التوصية:** ✅ تبقى. **قيمتها عالية جداً** (575 سطر بصري). ربط بارز من Hub.

#### `/guidelines/subscribers`
- **محتواها:** إدارة المشتركين + الخصوصية + الممارسات
- **علاقتها بـ SYNTHESIS:** ❌ ما تتكرر — operational only
- **التوصية:** ✅ تبقى. ربط من "العمليات"

#### `/guidelines/tracking`
- **محتواها:** GTM + GA setup + قراءة البيانات
- **علاقتها بـ SYNTHESIS:** §16 Off-Page يذكر GSC monitoring لكن tracking أعمق
- **التوصية:** ✅ تبقى. ربط من قسم "التتبع والقياس"

### 🟡 REBUILD (الـ landing فقط — يحتاج إعادة هيكلة)

#### `/guidelines` (الـ landing الحالي)
- **محتواها:** 3 cards كبيرة (Designer / Content Writer / SEO Specialist) + 9 sub-page cards + 5 data structures
- **المشكلة:** ينقصه Strategy + Sales + Brand identity + Onboarding (الـ §1-13 من SYNTHESIS)
- **التوصية:** 🔄 **يُعاد بناؤه كـ Hub موحّد بـ sidebar** (طبق رؤية المستخدم)
- **خطة:** نحوّله من scrolling page إلى Dashboard with sidebar

---

## 3. Migration Map — Existing → New Structure

### الـ Hub الجديد (Phase 4 target)

```
admin/app/(public)/guidelines/
│
├── page.tsx                          ← REBUILD (landing سردي + 5 role cards)
│                                       يقرأ من SYNTHESIS §1-3 (Welcome/Definition/Founder)
│
├── components/
│   ├── guideline-layout.tsx          ← KEEP (shared layout)
│   ├── hub-sidebar.tsx               ← NEW (persistent sidebar للـ Hub)
│   └── synthesis-renderer.tsx        ← NEW (يقرأ markdown sections)
│
├── strategy/                          ← NEW (SYNTHESIS §1-3)
│   └── page.tsx
│
├── brand/                             ← NEW (SYNTHESIS §4 + §14 = brand identity + design specs)
│   └── page.tsx
│
├── customers/                         ← NEW (SYNTHESIS §5-6 = ICPs + Pain Points)
│   └── page.tsx
│
├── product/                           ← NEW (SYNTHESIS §7-8 = 3-layer + Four Powers)
│   └── page.tsx
│
├── sales-playbook/                    ← NEW (SYNTHESIS §9-11 = Positioning + Pricing + Scripts)
│   └── page.tsx
│
├── marketing/                         ← NEW (SYNTHESIS §12 = Channels + Journey + KPIs)
│   └── page.tsx
│
├── team-onboarding/                   ← NEW (SYNTHESIS §13 = Week 1 plan + SWOT)
│   └── page.tsx
│
├── golden-rules/                      ← NEW (GOLDEN-RULES.md — 20 verbatim rules)
│   └── page.tsx
│
├── articles/page.tsx                  ← KEEP (existing, 14K)
├── authors/page.tsx                   ← KEEP (existing, 21K)
├── clients/page.tsx                   ← KEEP (existing, 12K)
├── media/page.tsx                     ← KEEP (existing, 16K)
├── media/article-preview/page.tsx     ← KEEP
├── media/client-preview/page.tsx      ← KEEP
├── media/postcard-preview/page.tsx    ← KEEP
├── organization/page.tsx              ← KEEP (existing, 20K)
├── seo-visual/page.tsx                ← KEEP (existing, 38K — قيمته عالية)
├── subscribers/page.tsx               ← KEEP (existing, 10K)
└── tracking/page.tsx                  ← KEEP (existing, 14K)
```

### Hub Sidebar الموحّد (الفكرة الذكية للمستخدم)

```
┌────────────────────────────────────────────────────────────┐
│ Header: Modonty · Knowledge Hub                            │
├────────┬───────────────────────────────────────────────────┤
│        │  Landing — قصة سردية (للموظف الجديد)             │
│ 📖 عن  │                                                   │
│ Modonty│   "تخيل أنك دخلت اليوم Modonty…"                  │
│        │   - من نحن (§2)                                   │
│ ✨ Big │   - ماذا نقدم (§7 + §8)                            │
│ Idea   │   - فلسفتنا (§3)                                  │
│        │   - عملاؤنا (§5)                                  │
│ 📣 ت+م │   - الخطوة التالية: ابدأ من قسمك                  │
│ ✍️ كاتب│                                                   │
│ 🎨 مصمم│                                                   │
│ 📊 SEO │                                                   │
│ ⚙️ ع...│                                                   │
│        │                                                   │
│ ────── │                                                   │
│ Quick: │                                                   │
│ 🥇 Gold│                                                   │
│ 📚 Glos│                                                   │
└────────┴───────────────────────────────────────────────────┘
```

---

## 4. New Pages Detail

### Pages to Build (8 صفحات جديدة)

| Path | المحتوى من | الحجم المتوقع | الجمهور |
|---|---|---|---|
| `strategy/` | SYNTHESIS §1-3 | متوسطة | كل الأدوار + موظف جديد |
| `brand/` | SYNTHESIS §4 + §14 | متوسطة | مصمم + كاتب |
| `customers/` | SYNTHESIS §5-6 | كبيرة | تسويق + مبيعات + محتوى |
| `product/` | SYNTHESIS §7-8 | كبيرة | كل الأدوار |
| `sales-playbook/` | SYNTHESIS §9-11 | كبيرة جداً | مبيعات (الأهم) |
| `marketing/` | SYNTHESIS §12 | كبيرة | تسويق |
| `team-onboarding/` | SYNTHESIS §13 + onboarding source | متوسطة | موظف جديد |
| `golden-rules/` | GOLDEN-RULES.md | متوسطة | كل الأدوار (للحفظ) |

### الـ Landing Page الجديد

**يستبدل** الصفحة الحالية (1224 سطر) بـ:
- Hero + Sidebar + قصة سردية في الـ main
- ينتهي بكروت كبيرة لكل دور تنقل لصفحته
- يحتفظ بكل الـ data structures الحالية في صفحاتها الجديدة

### الجمل المعالجة من landing الحالي

كل المحتوى الـ unique في landing الحالي محفوظ بالفعل في `sources/07-operations/admin-guidelines-extracted.md`. المحتوى يتوزّع على:
- `designerRules` → `brand/` page (+ ربط لـ media)
- `seoSections` → `articles/` page الموجودة (لا تتكرر)
- `seoPillars` → صفحة جديدة `seo-pillars/` ضمن `marketing/` أو `sales-playbook/`
- `seoTools` → صفحة جديدة `seo-tools/` ضمن `marketing/`
- `seoProhibitions` → صفحة جديدة `seo-prohibitions/` ضمن `articles/` (تحذيرات)

---

## 5. Phase 4 Action Plan

### 🚦 الترتيب المقترح (لكل خطوة TSC + visual check)

**Step 1 — Foundation (يوم 1)**
- إنشاء `hub-sidebar.tsx` component
- إنشاء `synthesis-renderer.tsx` component (يقرأ MD ويحوله JSX)
- إعادة بناء `page.tsx` كـ landing سردي مع sidebar
- ✅ Visual: الـ landing الجديد يعرض، الروابط لكل القديم تشتغل

**Step 2 — Strategy Pages (يوم 2)**
- إنشاء 4 صفحات: `strategy/`, `brand/`, `customers/`, `product/`
- كل واحدة تستهلك section من SYNTHESIS
- ✅ Visual: 4 صفحات جديدة + sidebar يبرز الحالية

**Step 3 — Sales + Marketing (يوم 3)**
- `sales-playbook/` (الأكثر محتوى — السكريبتات + الاعتراضات + الإغلاق)
- `marketing/` (channels + journey + KPIs)
- ✅ Visual: مدير المبيعات يقدر يعمل training session كامل

**Step 4 — Team + Golden Rules (يوم 4)**
- `team-onboarding/` (Week 1 plan)
- `golden-rules/` (20 قاعدة للحفظ)
- ✅ Visual: موظف جديد يفتح اللينك ويفهم Modonty في 30 دقيقة

**Step 5 — Polish + Migrate cards (يوم 5)**
- يربط الـ Hub بـ Header link من admin sidebar
- يفحص كل الـ 9 sub-pages الحالية تظهر صح في الـ sidebar
- ✅ Visual: Playwright على كل صفحة + screenshot review

### 🛡️ Risk Mitigation

- ❌ **زيرو حذف** للـ 9 sub-pages الحالية
- ❌ **زيرو تعديل** على `guideline-layout.tsx` المشترك
- ✅ **landing فقط** هي اللي تتغيّر بشكل كبير
- ✅ كل صفحة جديدة = ملف منفصل، يمكن revert بدون التأثير على الباقي
- ✅ Audit before commit: لو شي ما اشتغل، نرجع للـ landing القديم بـ git revert

---

## 6. القرار المطلوب من المستخدم قبل Phase 4

| السؤال | اقتراحي |
|---|---|
| Sidebar مكان؟ | يمين (RTL) — ثابت — عرض 280px |
| الـ landing الجديد يحفظ شي من القديم؟ | ✅ نعم — الـ 9 cards للـ sub-pages تبقى في الـ Hub، بس بشكل أنظف |
| الترتيب: نبدأ Step 1 ولا نقسم أكتر؟ | Step 1 أول، نراجع، بعدين Step 2 |
| اللغة في الصفحات الجديدة | عربي + مصطلحات تقنية بالإنجليزية (نفس SYNTHESIS) |
| الـ design tokens | نفس الموجود في admin (لا تعديل على Tailwind) |

---

## ✅ الخلاصة

- **Inventory:** 12 صفحة + 1 layout — ممتازة الجودة
- **Audit:** 11 صفحة تبقى كما هي · 1 صفحة (landing) تُعاد بناؤها
- **Migration risk:** 🟢 منخفض جداً — نضيف، ما نحذف
- **8 صفحات جديدة** ستُبنى من SYNTHESIS — كلها داخلها معالج محتوى واضح
- **زيرو data loss:** كل المحتوى الحالي محفوظ في `sources/07-operations/admin-guidelines-extracted.md` كمرجع تاريخي

**جاهز للـ Phase 4 لما توافق على Step 1.**
