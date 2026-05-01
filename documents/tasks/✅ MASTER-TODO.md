# MASTER TODO — MODONTY
> **آخر تحديث:** 2026-05-01 (Session 76 — Knowledge Hub Phase 4 Steps 1-4am DONE — **/guidelines/tracking DELETED — same logic as subscribers + seo-specialist (client-managed, not team-managed). Sidebar 7→6 sub-pages**. Knowledge Hub now lean: Media · Articles · Authors · Clients · Organization · معاينة البحث والمشاركة + Prohibitions in navbar.)
> **🎯 Master plan:** [Perfect-SEO-Plan.md](Perfect-SEO-Plan.md) — 108 task across 13 phases · ~33 يوم عمل · يستبدل **الجزء الميكانيكي** من SEO Specialist (95%) · لا يستبدل الـ Strategy/Content/Backlinks (الـ 80% من النجاح الفعلي) · راجع قسم "Reality Check" في الملف للحقيقة الكاملة
> **خطة Dashboard rebuild:** [Dashboard-Action-Plan.md](Dashboard-Action-Plan.md) · [Mockup v2](../../admin/public/dashboard-mockup-v2.html)
> **خطة URL Lifecycle & Coverage:** [URL-Lifecycle-Plan.md](URL-Lifecycle-Plan.md) — 22 task across 3 phases
> **الإصدار الحالي:** admin v0.42.0 | modonty v1.41.1 | console v0.2.0
> المهام المنجزة في → [🏆 MASTER-DONE.md](🏆%20MASTER-DONE.md)

---

> 🟢 LOW items → [💡 NICE-TO-HAVE.md](💡%20NICE-TO-HAVE.md)

---

## 🔴 URGENT — Pricing & Sales Integration with jabrseo.com (Pending — after Knowledge Hub)

### PRC-01 🔴 URGENT — Build pricing/features integration: jabrseo.com → modonty (admin + console)
- **Context:** jabrseo.com هو بوابة البيع لمودونتي. الأسعار + المزايا + الخصائص اللي ياخذها العميل لازم تكون متمركزة في jabrseo (single source of truth).
- **Why urgent:** نحتاجها فوراً بعد الانتهاء من Knowledge Hub لأن:
  - admin يستخدمها لعرض الباقات في `/guidelines/clients` (Sales reference)
  - console يستخدمها لعرض باقة العميل + upgrade prompts
  - أي تحديث سعر يجب يظهر في جميع الأماكن فوراً
- **المقترح المعتمد (Option A — REST API):**
  1. **jabrseo.com:** `app/api/pricing/route.ts` — يرجع JSON بـ:
     ```ts
     {
       tiers: [
         { tier: "BASIC", articlesPerMonth: 2, price: 2499, currency: "SAR", features: [...], benefits: [...] },
         { tier: "STANDARD", ... },
         { tier: "PRO", ..., popular: true },
         { tier: "PREMIUM", ... }
       ],
       updatedAt: ISO
     }
     ```
  2. **modonty (admin):** `lib/pricing/fetch-pricing.ts` — server function مع `unstable_cache` (TTL ساعة) + DEFAULT_PRICING fallback
  3. **modonty (console):** نفس lib + استخدام في settings page + upgrade prompts
  4. **Webhook لاحقاً:** `revalidateTag("pricing")` لو احتجنا real-time invalidation
- **الأسئلة المعلَّقة (تحتاج إجابة قبل التنفيذ):**
  1. الأسعار + المزايا الحالية موجودة في jabrseo DB؟ أو نبتدي من الصفر؟
  2. Endpoint عام (read-only) أو نضيف API key للحماية؟
  3. هل فيه مواقع تانية غير modonty تستهلك نفس البيانات؟
- **التأثير المتوقع:**
  - admin/guidelines/clients: ينقل من hardcoded → live data من jabrseo
  - console/settings: subscription card يقرأ المزايا الكاملة من jabrseo
  - أي صفحة pricing/upgrade تستخدم نفس المصدر
- **الأولوية بعد:** انتهاء Knowledge Hub Phase 4 + push admin v0.46.0
- **Files to create/modify (estimated):**
  - jabrseo.com — `app/api/pricing/route.ts` (جديد)
  - modonty/admin — `lib/pricing/fetch-pricing.ts` (جديد) + `guidelines/clients/page.tsx` (تعديل)
  - modonty/console — `lib/pricing/fetch-pricing.ts` (mirror) + `settings/components/subscription-card.tsx` (تعديل)

---

## 📚 Knowledge Hub Project (Session 76 — 2026-05-01) — IN PROGRESS

### KH-01 ✅ PHASE 1 DONE — Sources gathered (13 files · 18MB)
- [x] Created `documents/guideline/` + `sources/` + `README.md`
- [x] Khalid uploaded source materials (existing 4 + brand book PDF + 7 mix/ files)
- [x] Removed 2 explicit duplicates (DOCX of brand guidelines + .md duplicate of master brief)
- [x] **Drive scan via MCP** — read Google Doc brand guidelines, downloaded 2 essential SVG logos (primer-logo.svg + icon.svg). Drive content saved as `brand-guidelines-from-google-doc.md`.
- [x] Final inventory:
  - **brand book/** — canonical PDF + logos-svg/ (primer + icon)
  - **brand-guidelines-from-google-doc.md** — text-readable distillation
  - **4 master playbooks** — MASTERCLASS, MARKETING-BRIEF-2026, PRODUCT-MARKETING-MASTER-BRIEF (HTML)
  - **mix/** (7 files) — Marketing plan + brand strategy + onboarding + Saudi market study + B2B SaaS personas + KPIs + dashboard

### KH-02 ✅ PHASE 2 DONE — Sources categorized into 6 themed folders
- [x] Read structures of all 11 HTML sources + Brand Guidelines doc
- [x] Categorized into: `01-brand/` · `02-strategy/` · `03-sales/` · `04-customers/` · `05-team/` · `06-dashboards/`
- [x] Sources untouched — only moved (immutable rule preserved)

### KH-03 ✅ PHASE 3 DONE — Synthesis produced (then expanded after user flagged missing source)
- [x] **`SYNTHESIS.md`** — **764 lines** · 18 sections (was 13, added 5 operational)
  - **Strategy layer (§1-13):** Welcome / Definition / Founder / Brand / Customer / Pain / Product / Powers / Positioning / Pricing / Sales Playbook / Marketing / Operations
  - **Operations layer (§14-18):** Designer Specs / Content Writer SEO Rules / SEO Specialist 3 Pillars / SEO Tools / Prohibitions
- [x] **`GOLDEN-RULES.md`** — 211 lines · 20 verbatim rules
- [x] **`CHANGELOG.md`** — 201 lines · full source-to-section traceability + Phase 1 update logged
- [x] **NEW source added** (after user note): `sources/07-operations/admin-guidelines-extracted.md` (277 lines) — extracted from `admin/app/(public)/guidelines/page.tsx` data structures (designerRules + seoSections + seoPillars + seoTools + seoProhibitions + guidelineSections) + 9 sub-pages
- [x] Every claim cites its source file (per immutability rule)
- [x] Language: Arabic primary + English for technical terms (per professional standard)
- [x] **Phase 4 architectural note logged in CHANGELOG:** new Hub MUST integrate (not duplicate) the 9 existing admin/guidelines sub-pages. Strategy content (§1-13) gets new pages; Operations content (§14-18) links to existing admin pages.

### KH-3.5 ✅ PHASE 3.5 DONE — Audit before Build (Migration Map produced)
- [x] **Inventory:** 12 صفحة + 1 layout component في `admin/app/(public)/guidelines/`
- [x] **Audit per page:** كل صفحة → جمهور + محتوى + علاقة بـ SYNTHESIS + توصية
- [x] **Output:** `documents/guideline/MIGRATION-MAP.md` (يحتوي على Inventory + Content Audit + Migration Map + Phase 4 Action Plan + Risk Mitigation)
- [x] **القرار المعماري:** 11 صفحة تبقى كما هي (KEEP) · فقط الـ landing يُعاد بناؤه. زيرو حذف.
- [x] **8 صفحات جديدة** مقترحة (strategy, brand, customers, product, sales-playbook, marketing, team-onboarding, golden-rules) — كل واحدة تستهلك section من SYNTHESIS

### KH-04 🟡 PHASE 4 IN-PROGRESS — Hub UI build (incremental)

#### Step 1 ✅ DONE — Foundation: sidebar at layout level + zero data loss
- [x] Created `admin/app/(public)/components/hub-sidebar.tsx` — 3 groups: في هذه الصفحة (4 anchors) · الأدلة العملية (8 sub-pages) · قريباً (7 placeholders with Lock icon)
- [x] Modified `admin/app/(public)/layout.tsx` — wrapped children in flex layout `[sidebar | main]`, kept existing header, added scroll-smooth
- [x] Added `id` + `scroll-mt-20` to 4 main cards in `page.tsx` (designer · writer · seo · prohibitions)
- [x] **Zero data changes** — all 1224 lines of landing content + 9 sub-pages untouched
- [x] **Sub-pages get sidebar automatically** (architectural win — sidebar in layout, not page)
- [x] TSC admin: exit=0
- [x] Live test: Playwright screenshot confirms sidebar renders on right (RTL), 3 groups visible, sub-pages list intact, "قريباً" items show Lock icon

#### Step 2 ✅ DONE — Media → Design Hub (consolidate all design content)
- [x] **User insight:** "كل ما يخص التصميم في URL Media واحد"
- [x] Copied 2 SVGs: `admin/public/brand-assets/primer-logo.svg` + `icon.svg`
- [x] Extended `admin/app/(public)/guidelines/media/page.tsx` with 4 new Cards (matching existing design system: colored borders + icon circles + tables + bg-muted/50 headers):
  - 🎨 **Brand Colors** (violet) — 5 main swatches + 3 greys with HEX/RGB/role
  - 🔤 **Typography** (indigo) — Montserrat + Tajawal samples + hierarchy table
  - 🛡️ **Logo Rules** (rose) — 3 forms + minimum sizes table + Clearspace + 6 DON'Ts grid
  - 📦 **Logo Assets** (sky) — 2 actual SVG previews (rendered live) + download links
- [x] Zero deletion — existing Golden Rule + Safe Zone + Page Previews + Categories all preserved
- [x] TSC admin: exit=0
- [x] Playwright × 3 screenshots: Brand Colors swatches render with actual hex colors · Typography renders Montserrat+Tajawal correctly · Logo Rules + DON'Ts grid + Clearspace warning · SVG logos render live

#### Step 3 ✅ DONE — Inline Tabs for the 3 page previews (no external clicks)
- [x] **User insight:** "بدل ما أروح للرابط الثاني، ليه ما نعرض الـ data في نفس الصفحة"
- [x] Created `media/components/` with 4 shared components:
  - `image-placeholder.tsx` (was duplicated 3 times across sub-pages — now single source)
  - `article-preview-content.tsx`
  - `client-preview-content.tsx`
  - `postcard-preview-content.tsx`
- [x] Refactored 3 sub-pages (`media/article-preview/page.tsx`, `client-preview/page.tsx`, `postcard-preview/page.tsx`) to use shared components — direct URLs still work
- [x] Replaced 3 link cards in `media/page.tsx` with shadcn `Tabs` containing all 3 previews inline
- [x] Architectural win: dedup (~700 lines of placeholder code consolidated to 1 component)
- [x] TSC admin: exit=0
- [x] Live test: Playwright `browser_click` on Client tab → switches correctly, full client preview renders inline (Hero Cover + Logo + tabs internal + content)

#### Step 4c ✅ DONE — Logo light + dark variants from Drive
- [x] User: "اللوجو هنا عارض الـ dark، الـ light فين؟"
- [x] Downloaded `اللوجو الاساسى على خلفية غامقة .svg` (id 1S2Sat...) from Drive via MCP
- [x] Saved to `admin/public/brand-assets/logo-dark.svg` (white text · navy box · for dark bg)
- [x] Renamed existing `primer-logo.svg` → `logo-light.svg` (clearer naming)
- [x] Updated Logo card: Full Logo now shows both variants on appropriate bg containers (white for light · slate-900 for dark)
- [x] Icon (Logomark) shown on both bgs as same SVG — transparent note left for user to decide if dedicated icon-dark variant needed

#### Step 4b ✅ DONE — Removed Minimum Sizes table (AD call: irrelevant for digital-only product)
- [x] User question: "هل هذه محتاجينها؟" (Minimum Sizes table)
- [x] AD verdict: NO. Modonty is digital-only — print column (mm) is dead weight. 50px/150px digital minimums are common knowledge for any working designer. Not brand-specific = doesn't belong in brand guidelines.
- [x] Removed the entire Minimum Sizes table from Logo card
- [x] Result: Logo card now has only the brand-specific rules (Clearspace + DON'Ts) + the actual assets (SVGs)

#### Step 4 ✅ DONE — Art Director cleanup of `/guidelines/media`
- [x] **User invoked AD lens** + clarified team: 3 graphic designers + 2 video creators under the AD
- [x] **Color palette discipline:** 7 accent colors → **3** (emerald=do · amber=warn · primary=action · neutral=rest)
- [x] **Section consolidation:** 9 cards → 6
  - Brand Colors + Greys → single 8-swatch grid (one row)
  - Logo Rules + Logo Assets → single "Logo" card (SVG previews + sizes + Clearspace/DON'Ts side-by-side)
  - Removed Typography hierarchy table (redundant with samples)
- [x] **Preview Tabs simplified** — stripped simulated nav + breadcrumb + summary legend from all 3 preview components (`article-preview-content.tsx`, `client-preview-content.tsx`, `postcard-preview-content.tsx`). Standalone URLs still work — they keep the annotation banner from the page wrapper.
- [x] **Header pattern variety** — replaced colored icon-circles with inline neutral icons (avoid monotony)
- [x] **Unified warning style** — DON'Ts now use amber (matches Clearspace + Safe Zone) instead of separate rose
- [x] TSC admin: exit=0 · 4 Playwright screenshots verified

#### Step 4d ✅ DONE — Brand fonts loaded admin-wide (Tajawal + Montserrat)
- [x] **User caught critical violation:** "احنا بنقول في الـ branding تبعنا نستخدم تجوال، واحنا مش مستخدمينه هنا. هنا ما لها من طامة ومصيبة"
- [x] Brand book mandates Tajawal (Arabic) + Montserrat (Latin) — but admin app wasn't loading them
- [x] Added `Tajawal` + `Montserrat` via `next/font/google` in `admin/app/layout.tsx` with `--font-tajawal` + `--font-montserrat` CSS vars
- [x] Updated `admin/tailwind.config.ts` with `fontFamily.sans` defaulting to Tajawal+Montserrat fallback chain + dedicated `font-tajawal` / `font-montserrat` utilities
- [x] Replaced inline `style={{ fontFamily }}` with Tailwind classes in media page typography card
- [x] All 7 sections in `media/page.tsx` made collapsible (`defaultOpen={false}`) per user "الـ false كله false"
- [x] TSC admin: exit=0 · Playwright screenshot confirms Tajawal renders on Arabic headings + all sections start collapsed

#### Step 4am ✅ DONE — /guidelines/tracking DELETED (client analytics, not team workflow)
- [x] **User:** "do" → execute deletion
- [x] **Reasoning:** GTM/GA4 setup is admin one-time field paste (~2 min), analytics consumption is client's job in console site-health + their own GA4. Already covered in clients guideline technical integrations section. 278 lines = overkill.
- [x] **Deleted:** `admin/app/(public)/guidelines/tracking/page.tsx` + folder
- [x] **Cleaned references:**
  - Removed `tracking` entry from landing grid
  - Removed item from hub-sidebar (was: التتبع والقياس)
  - Removed `BarChart3` import from landing (kept in hub-sidebar — still used for "استراتيجية التسويق" coming-soon item)
- [x] **Sidebar reduced:** 7 → 6 sub-pages
- [x] **Final Knowledge Hub structure:**
  - **Sidebar (الأدلة العملية):** معاينة البحث والمشاركة · دليل الوسائط · المقالات · الكتّاب · العملاء · تنظيم المحتوى
  - **Navbar:** الممنوعات (red prominent button)
- [x] **Pattern emerging:** kept = team workflow guidelines · deleted = client-managed features (seo-specialist · subscribers · tracking)

#### Step 4al ✅ DONE — /guidelines/subscribers DELETED (client-only feature, team doesn't use)
- [x] **User direction:** "احذفها — مش محتاجها" → "do"
- [x] **AD reasoning:** Subscribers feature lives in console for clients. Modonty team's role is to BUILD/MAINTAIN it, not USE it. A 259-line guideline for a feature the team doesn't touch = waste.
- [x] **Already covered:** clients guideline mentions "مشتركو النشرة" as one of 13 console pages (1 line) — sufficient for Sales context.
- [x] **Deleted:** `admin/app/(public)/guidelines/subscribers/page.tsx` + folder
- [x] **Cleaned references:**
  - Removed `subscribers` entry from `guidelines/page.tsx` `guidelineSections` array
  - Removed item from `hub-sidebar.tsx` (was: المشتركون)
  - Removed `Mail` import from both files (no longer used)
- [x] **Sidebar reduced:** 8 sub-pages → 7 (هدف الـ Knowledge Hub: only what team actually uses)
- [x] **Net effect:** consistent with seo-specialist deletion logic — features that are client-managed don't need team-facing guidelines.

#### Step 4ak ✅ DONE — /guidelines/organization simplified for 30-second comprehension
- [x] **User feedback:** "أنا شايف كلام كثير وأنا تايه فيه. فما بالك الموظف. حسني لي عشان أفهمها ببساطة"
- [x] **AD diagnosis:** 375-line reference page was overwhelming. Team needs DECISION HELP, not exhaustive documentation.
- [x] **Rebuilt page (190 lines, ~50% shorter):**
  1. **3 hero cards side-by-side** — Category · Tag · Industry, each with: متى تستخدمه + أمثلة + القاعدة الذهبية (one-liner)
  2. **Decision tree** — "حيران؟ اسأل نفسك" with 3 questions and arrow pointing to answer
  3. **3 common mistakes** — wrong + why + fix (focused on real team errors)
  4. **Auto-handled footer** — short reminder that system generates Slug/SEO Title/Description
- [x] **Deleted bloat:**
  - Comparison table (4 rows × 4 cols) — replaced with 3 hero cards
  - Shared fields table (6 rows) — moved to one-line footer "النظام يحلها"
  - Per-type best practices section (3 sections × 3-4 tips each) — distilled to one rule per card
  - Industry examples table — merged into hero card
- [x] **Comprehension test:** team member opens page → in 5 seconds knows what each is (3 cards) → in 15 seconds applies decision tree → in 30 seconds has scanned full page
- [x] **Net effect:** Manager + content writer + new joiner can use the page as a quick reference instead of a long read. Useful info retained, redundancy removed.

#### Step 4aj ✅ DONE — /guidelines/clients rebuilt as comprehensive Sales-grade client guide
- [x] **User direction:** "هذه من أهم الصفحات. صفحة العميل اللي حيدفع فلوس. مرتبطة بـ Console + admin + modonty. اعمل دراسة شاملة قبل ما تكتب."
- [x] **Comprehensive study completed across 3 apps:**
  - **DB Client model:** 100+ fields mapped (Identity · Branding · SEO · Business · Saudi/Gulf legal · Address · GBP · GTM/GA4 · Subscription · Intake)
  - **SubscriptionTier enum:** BASIC / STANDARD / PRO / PREMIUM (2/4/8/12 articles per month)
  - **SubscriptionTierConfig:** prices documented in DB but excluded from this page per user direction (separate Sales task)
  - **Console pages (13):** verified via console/app/(dashboard)/components/sidebar.tsx + folder scan (Profile · معلومات نشاطك · Articles · Content · Media · Campaigns · Subscribers · Leads · FAQs · Client Comments · Site Health · Settings · Support)
  - **Modonty public tabs (8):** verified via modonty/app/clients/[slug]/components/client-tab-items.ts (الكل · حول · تواصل · الصور · المتابعون · التقييمات · الريلز · الإعجابات)
  - **Cross-app journey:** admin (write DRAFT) → console (client approves) → admin (publishes) → modonty (public) → console (analytics)
- [x] **Page structure (7 sections):**
  1. **HERO — باقة العميل** (6 value props in 3-col grid): public page · monthly content · console dashboard · trusted domain authority · technical integration · Saudi/Gulf Local SEO
  2. **الباقات الـ 4** — comparison cards (BASIC/STANDARD/PRO/PREMIUM) with article counts only — pricing redirected to Sales conversation
  3. **رحلة العميل — 5 خطوات عبر 3 أسطح** — vertical timeline showing actor (admin/client/visitors) + location (admin.modonty/console/modonty.com) + action per step
  4. **console.modonty.com — 13 صفحة في يد العميل** — value-prop per page (Sales-focused: what each page actually does for client)
  5. **الصفحة العامة على modonty.com — 8 تبويبات** — public visitor experience + URL structure + Schema.org callout
  6. **التكامل التقني — 6 أنظمة مدمجة تلقائياً** — GBP · GTM · GA4 · Schema.org · Local SEO · Knowledge Graph
  7. **🎯 ملاحظة للسيلز — كيف تتكلم مع العميل** — 4 talking points + reference to upcoming Sales task
- [x] **AD-grade design:**
  - Color-coded surfaces: blue=admin, violet=console, emerald=modonty
  - "Most Popular" badge on PRO tier
  - Vertical journey timeline with role + location chips
  - Sales callout card distinguishing this from technical guideline
- [x] **Pricing explicitly excluded** per user: "سيب موضوع الأسعار، حنتكلم في Task تبعه" — placeholder shows "تواصل مع فريق المبيعات للتفاصيل"
- [x] **Net effect:** the page is now a comprehensive Sales reference. A new Sales rep can open it and understand exactly what to offer + how the client's experience flows + what they get in console. Used as both onboarding for Sales team + transparent reference for prospective clients.

#### Step 4ai ✅ DONE — Authors page rewritten as ACTIONABLE guideline
- [x] **User feedback:** "حقل sameAs مو واضح. اديني كلام يفهمني إيش أسوي. أنت مديني points إيش أسوي هي؟"
- [x] **User direction:** "محتاج كلام guideline يوجهني كيف أطلع بـ E-E-A-T لمدونتي حسب المصادر الرسمية"
- [x] **Sources researched:**
  - Schema.org sameAs official docs — Wikidata as primary example
  - Reputation X Wikidata setup guide — step-by-step entry creation
  - SEOStrategy Wikidata-for-SEO — Knowledge Graph integration
- [x] **Step 2 (sameAs) rewritten** from passive list of platforms → ACTIONABLE phased plan:
  1. 🚀 الأسبوع الأول — LinkedIn (افتح profile + workplace + 5 endorsements + رابط)
  2. 🚀 الأسبوع الأول — X/Twitter (حساب احترافي + bio + 10 تغريدات قبل النشر)
  3. 📰 الشهر الأول — Mentions (مقال ضيف في موقع موثوق)
  4. 🎓 إذا أكاديمي — Google Scholar profile
  5. 🏆 الشهر 2-3 — Wikidata entry (الجائزة الكبرى): account → 10-20 small edits for history → create entry with instance of + occupation + country + references → wait moderator approval → add Q-number to sameAs
  6. ✅ Golden rule: 5-10 quality links > 30 weak links
- [x] **Modonty Organization checklist replaced** with 3-phase Authority Plan (color-coded blue/violet/emerald):
  - 🏗️ المرحلة 1 — الأساس (الأسبوع 1): About page · Editorial Policy · Contact page
  - 🌐 المرحلة 2 — الحضور الرقمي (الأسبوع 2-3): GBP · LinkedIn Company Page · X · Organization Schema with sameAs
  - 🏆 المرحلة 3 — Knowledge Graph (الشهر 2-3): Industry mentions · Wikidata entry for Modonty (instance of Q1115791 = software platform) · Knowledge Panel verification
  - Each action has 3 fields: task · how (concrete steps) · impact (why it matters)
- [x] **Removed unused** `modontyAuthorityChecklist` const replaced with rich `modontyAuthorityPlan`
- [x] **Net effect:** the page transitioned from "list of things you need" → "step-by-step playbook with timeframes". User can pick up the page and execute Phase 1 in their first week, knowing exactly what to do.

#### Step 4ah ✅ DONE — Person vs Organization distinction clarified
- [x] **User caught contradiction:** "تطلب صورة حقيقية مش avatar للكتّاب — لكن مودونتي بتستخدم Logo. تعارض في الكلام."
- [x] **Real conflict:** page implied all authors need real photos, but Modonty (Organization) uses logo. Confused.
- [x] **Technical truth (per Google + Schema.org):**
  - Individual author = `@type: Person` → uses `image` (real photo required)
  - Modonty = `@type: Organization` → uses `logo` (no personal photo)
  - **Both** accepted by Google for Article `author` field
- [x] **Fixes applied:**
  - Section header retitled: "3 خطوات لبناء كاتب فردي موثوق — Person Schema"
  - Subtitle clarified scope: "هذي الخطوات تخصّ الكاتب الفردي. لما المؤلف = مودونتي، تنطبق قواعد Organization المختلفة"
  - Added blue callout box explaining the technical difference: Person→image, Organization→logo
  - Modonty section retitled: "مودونتي كمؤلف موثوق (Organization) — قائمة التحقق"
  - Modonty intro rewritten to reference `@type: Organization` + `logo` explicitly
- [x] **Net effect:** the apparent contradiction is now resolved with explicit schema-type framing. Designer reading the page knows which path applies (Person vs Organization) and what's needed for each.

#### Step 4ag ✅ DONE — /guidelines/authors rewritten as Modonty Authors Policy
- [x] **User policy:** "مودونتي هي المؤلف الأساسي للمقالات. إذا فيه مؤلف قوي brand name ممكن نستفيد منه"
- [x] **User direction:** "ارجع للمصادر الرسمية، ابني سياسة معتمدة لـ E-E-A-T"
- [x] **Sources verified (3 official refs):**
  - Google Article Author Best Practices: name + url + sameAs · all authors separately · Person schema type
  - Google Helpful Content + E-E-A-T: byline visible · author profile + bio · trust is most important
  - Schema.org Person + Wikidata: sameAs as connective tissue to Knowledge Graph (Wikidata = strongest target)
- [x] **Page rewritten** (431 lines → ~230 lines, focused 5-section design):
  1. **Hero policy card** (primary): "القاعدة — مودونتي هي المؤلف الافتراضي" + strategic reasoning
  2. **3 exception cases** (amber): Subject-Matter Authority · Brand Partnership · Personal Voice — each with example
  3. **3-step E-E-A-T builder** (emerald vertical timeline): Profile completeness · sameAs (most important field) · Consistency check
  4. **Modonty-as-Author checklist** (violet): 6 prerequisites for "مودونتي" to be a credible author entity (About page · Editorial Policy · Org schema · LinkedIn · GBP · industry mentions)
  5. **Official references** (4 cards): Google docs + Schema.org + Wikidata
- [x] **Key insights from research applied:**
  - sameAs is the MOST important E-E-A-T field for authors (Wikidata > LinkedIn > Scholar)
  - Byline name MUST match schema name MUST match profile page name (consistency = critical)
  - In 2026, Gemini AI Mode uses author schema for citation verification
  - Modonty CANNOT be an "authority author" without infrastructure (About page, Editorial policy, Org schema, sameAs)
- [x] CSS conflict warning fixed (bg-emerald-500/10 + bg-background redundancy)
- [x] **Net effect:** the page now codifies modonty's editorial governance — when to use individual author vs platform-as-author, what makes each credible, and the exact steps to build Google-recognized authority. References embedded for ongoing source-of-truth.

#### Step 4af ✅ DONE — /guidelines/seo-specialist DELETED (Technical SEO = system responsibility)
- [x] **User direction:** "Technical SEO الـ System بيعمله — هل نضيفها ولا نخليها مخفية؟" → AD recommendation: hide → "do"
- [x] **AD reasoning:** Modonty's golden rule "JSON-LD = code responsibility, not admin task" applies broadly to Technical SEO. Adding it as a guideline:
  - Creates false expectation that it's admin-configurable
  - Confuses non-technical team members
  - Duplicates Prohibitions (التقني tab) + Articles auto-handled chips
- [x] **Deleted:** `admin/app/(public)/guidelines/seo-specialist/page.tsx` + folder
- [x] **Cleaned references:**
  - Removed entry from `guidelines/page.tsx` `guidelineSections` array (landing grid)
  - Removed item from `hub-sidebar.tsx` (was: تحسين محركات البحث)
  - Removed `TrendingUp` import from both files (no longer used)
- [x] **Existing coverage retained:**
  - "يُعالجه النظام تلقائياً" chips in Articles page (6 items: Slug, JSON-LD, Canonical, OG Tags, etc.)
  - Prohibitions page (التقني tab — 12 SEO violations)
  - SEO-Visual page (how content appears in search)
- [x] TSC admin: exit=0
- [x] **Net effect:** sidebar reduced from 9 sub-pages → 8. Landing grid simpler. Team focuses on what they CAN control (Articles · Prohibitions · Visual) without being overwhelmed by Technical SEO they don't manage.

#### Step 4ae ✅ DONE — Articles page COMPLETE — full code scan + Google 2026 sources
- [x] **User direction:** "هل أضفت Related Articles؟ اعمل scan كامل لدورة حياة المقال — يطلع 100% perfect — شوف الكود + المصادر الرسمية + latest update — اعطيني سر الطبخة"
- [x] **Full Article model scan (50+ fields):** verified `dataLayer/prisma/schema/schema.prisma:752-882` — found multiple gaps in guideline:
  - Related Articles model has 3 relationship types (related/similar/recommended) — NOT in guideline
  - lastReviewed (freshness signal) — missing
  - citations[] (E-E-A-T) — missing
  - semanticKeywords (Wikidata) — missing
  - audioUrl (audio version) — missing
  - breadcrumbPath (BreadcrumbList schema) — missing
- [x] **Google Article Schema 2026 verified** via WebFetch (developers.google.com/search/docs/appearance/structured-data/article):
  - No required properties — all recommended
  - Image specs: ≥50,000 pixels + 16:9 + 4:3 + 1:1 aspect ratios for Discover/AMP
  - Author: Person/Organization, name + url + sameAs
  - Multi-part articles need canonical to individual page
- [x] **3 critical updates applied:**
  1. **Related Articles expanded** in Phase 3 FAQs tab — now mentions 3 relationship types (related · similar · recommended) + recommends 3-5 articles
  2. **Image specs upgraded** in Phase 2 Content tab — "1200×630 الأساسي + Google يفضّل 3 نسب (16:9 · 4:3 · 1:1) للظهور في Google Discover · حد أدنى 50,000 بكسل"
  3. **NEW E-E-A-T Card added** between Auto-handled and Status flow — 6 quality boosters explained:
     - 📚 Citations — external sources for isBasedOn schema
     - 👤 Author Profile — name + url + sameAs (Google requirement)
     - 📅 lastReviewed — freshness signal, refresh every 6 months
     - 🎯 Semantic Keywords — Wikidata for AI crawlers (ChatGPT/Perplexity)
     - 🎙️ Audio Version (audioUrl) — accessibility + Google Podcasts opportunity
     - 🍞 Breadcrumb — BreadcrumbList schema, improves CTR
- [x] **Net effect:** the page is now a TRUE "سر الطبخة" — covers the full Article workflow including the hidden quality fields that separate ranking content from average content. Every claim traces to either real code (schema.prisma + step components) or official Google docs.

#### Step 4ad ✅ DONE — Separation of duties: Client APPROVES · Admin PUBLISHES
- [x] **User correction:** "العميل يمنحني الـ approve وليس الـ publish. الـ publish بيتم من عندنا، ولكن الـ approve بيجي من العميل. فعدل مراحل الحياة المقالة"
- [x] **Conceptual reframe applied** to articles guideline page:
  - **Phase 3 expanded to 4 tabs** (was 3): FAQs · Publish settings · Client Approval · **Final Publish (NEW)**
    - "Publish settings" — admin chooses publication strategy (immediate vs scheduled) → saves as DRAFT to send to client
    - "Client Approval" — note rewritten with `🤝 شغل العميل` framing + explicit "⚠️ العميل لا ينشر — مجرد يعتمد"
    - "Final Publish" — admin's transition action after client approval, moves to PUBLISHED or SCHEDULED
- [x] **Status timeline rebuilt with actor labels:**
  - WRITING — 👤 الأدمن
  - DRAFT — 👤 الأدمن أرسلها
  - 🤝 العميل يعتمد (transition label)
  - SCHEDULED — 👤 الأدمن نَشَر
  - 🤖 آلي في الموعد (transition label)
  - PUBLISHED — ✅ يظهر للقارئ
  - ARCHIVED — 👤 لاحقاً
- [x] **Header rewritten:** "دورة حياة المقال — مَن يفعل ماذا؟" + subtitle "العميل يعتمد فقط — الأدمن هو من ينشر. الفصل بين الدورين مقصود."
- [x] **2 role-explainer cards** added at bottom:
  - 🤝 دور العميل: الاعتماد فقط (blue) — explicit "العميل لا يقدر ينشر بنفسه — هذا ليس دوره"
  - 👤 دور الأدمن: النشر (emerald) — explicit "النشر = شغل الأدمن، مش العميل"
- [x] Visual verified via Playwright — separation of duties is now visually + conceptually unambiguous
- [x] **Net effect:** the page reinforces editorial governance — clients trust the workflow because they know they only approve content, not push it live; admins retain full control over timing + actual publication.

#### Step 4ac ✅ DONE — Articles page rebuilt + 2 critical workflow gaps filled
- [x] **User feedback round 1:** "أبهرني، 3 مراحل واضحة، احذف الحشو"
- [x] **User feedback round 2:** "ما زالت المعلومات ناقصة — مرحلة التعميد من العميل من الـ console + معلومات الـ slug"
- [x] **Round 1 — Major redesign:**
  - 7 cards → 3 cards (removed: contentTips · autoFeatures · SEO Checklist · AI Assistant)
  - articleSteps table → **3-phase Journey timeline** (vertical violet/emerald/amber line)
  - Each phase: big Arabic numeral circle (١/٢/٣) + ordinal name + description + admin tab cards inside
  - Auto-handled features moved to inline footer chips
- [x] **Round 2 — Critical gaps filled:**
  1. **Slug full nuances** added to Basic tab note: "يُولَّد تلقائياً من العنوان · بالإنجليزي + كلمة مفتاحية · ممنوع تواريخ/أرقام · بعد النشر يحتاج 301 redirect"
  2. **Client Approval workflow** added as 3rd tab in Phase 3 (النشر والاعتماد):
     - Tab name: "اعتماد العميل (في console.modonty.com)"
     - Icon: ShieldCheck
     - Required: true
     - Note explains: العميل يدخل console.modonty.com › المقالات → يعتمد (→ SCHEDULED/PUBLISHED) أو يطلب تعديلات (→ يرجع للأدمن)
- [x] **Status flow rebuilt** to match actual ArticleStatus enum:
  - 5 real states: WRITING → DRAFT → SCHEDULED → PUBLISHED → ARCHIVED
  - "العميل يعتمد" callout between DRAFT → SCHEDULED
  - 2 explanatory cards: ⚠️ مرحلة الاعتماد + 📅 جدولة (شرح SCHEDULED logic)
- [x] Source verified against real code: `console/app/(dashboard)/dashboard/articles/actions/article-actions.ts` (approveArticle + requestChanges) + `dataLayer/prisma/schema/schema.prisma:23-29` (ArticleStatus enum)
- [x] **Net effect:** the page now reflects the FULL editorial pipeline including the cross-app handoff. A new content writer reads it and understands: "I write in admin → save as DRAFT → client approves in console → article goes live". Zero blind spots.

#### Step 4aa ✅ DONE — /guidelines/articles synced with real admin workflow
- [x] **User direction:** "راجع الكود مراحل الـ article عشان تكون الصفحات هذه متوافقة له"
- [x] **Audited the source of truth:** `admin/app/(dashboard)/articles/helpers/step-validation-helpers/step-configs.ts` defines `STEP_CONFIGS` — the actual admin workflow has **5 tabs**, not 12 separate steps as the guideline implied.
- [x] **Real admin workflow (5 tabs):**
  1. Basic — Title, excerpt, client, category, author, tags + slug (REQUIRED)
  2. Content — Article content + featured image + media gallery (REQUIRED)
  3. SEO — SEO Title, Description, Keywords, Semantic Keywords, Meta Robots (REQUIRED)
  4. FAQs & Related — FAQs + related articles (OPTIONAL)
  5. Publish — Schedule, canonical, twitter, citations, sitemap, license (OPTIONAL but required for going live)
- [x] **Updated articleSteps array** to match exactly. Each row now shows: real tab name (Arabic + English) + actual fields + accurate required/optional flag + helpful description with real character limits + admin behavior (e.g., "العنوان يولّد الرابط تلقائياً")
- [x] **Updated header copy:** "خطوات إنشاء المقال (12 خطوة)" → "خطوات إنشاء المقال — 5 تبويبات في محرر الأدمن"
- [x] **Subtitle clarified:** explains the tab grouping: "كل تبويب يجمع حقول مرتبطة بنفس المرحلة"
- [x] Visual verified via Playwright — table shows 5 rows with مطلوب/اختياري badges
- [x] **Net effect:** when a content writer reads the guideline and then opens the admin editor, they see exactly what the guideline described. No more "where's the Citations tab?" confusion (Citations is part of Publish tab, not separate).

#### Step 4z ✅ DONE — Hub sidebar fully Arabized (16 labels translated)
- [x] **User direction:** "العناوين اللي في Side bar خليها كلها بالعربي. اختَر المصطلحات المناسبة."
- [x] **AD-curated Arabic terms (16 sidebar items):**
  - **الأدلة العملية group (9):** معاينة البحث والمشاركة (kept) · دليل الوسائط · المقالات · تحسين محركات البحث · الكتّاب · العملاء · تنظيم المحتوى · المشتركون · التتبع والقياس
  - **قريباً group (7):** عن Modonty (brand name kept) · البراند · العملاء المثاليون · دليل المبيعات · استراتيجية التسويق · تأهيل الفريق · القواعد الذهبية
- [x] Visual verified via Playwright — all labels render correctly in RTL
- [x] **Note:** landing grid cards still have mixed English titles ("Media & Image Standards", "Articles", "SEO Specialist", etc.) — consistency issue. User scope was sidebar-only, but grid alignment may be next request.

#### Step 4y ✅ DONE — /guidelines/seo-visual rewritten for non-technical audience
- [x] **User direction:** "أحسن الصياغة كاملة. تكون واضحة وتُعطي الصفحة قيمة"
- [x] **Audit revealed 15+ technical English terms** unclear to non-technical readers (designers/writers): Slug, SEO Title, Meta Description, Schema, JSON-LD, Rich Result, OG Image, OG Tags, Breadcrumb, Organization, Twitter Card, Article Rich Result, Basic, etc.
- [x] **AD intervention strategy:**
  1. **Glossary card added at TOP** — "قاموس مصطلحات الصفحة" with 6 most important terms. Each card: English term in code badge + Arabic equivalent (big & bold) + plain example + 📍 exact admin path. User reads this once and understands the entire page below.
  2. **Arabic-first labels everywhere** — "آخر الرابط (Slug)" instead of "الـ Slug". Pattern: Arabic primary, English in parens.
  3. **Admin paths translated** — "Basic → Slug" → "تعديل المقال › Basic › الرابط". User knows exactly where to click.
  4. **Schema/JSON-LD demystified** — text now reads: "النظام يكتب هذي المعلومات بلغة خاصة يفهمها جوجل... أنت لا تحتاج تتدخّل". Removed scary tech jargon.
  5. **Reframed "Rich Result"** → "البطاقة الموسَّعة"
  6. **Reframed "Organization"** → "المؤسسة"
  7. **Reframed "OG Tags"** → "بيانات المشاركة"
  8. **Reframed "OG Image"** as "صورة المشاركة (OG Image)"
- [x] **Final summary cards rewritten**: "Slug" → "آخر الرابط", "SEO Title" → "عنوان جوجل", etc. Maintains brand glossary consistency.
- [x] Visual verified via Playwright — Glossary visible with 2-col grid, all 6 terms clear, mobile-responsive.
- [x] **Net effect:** designer/content-writer/new-joiner can now open the page and understand every term + know exactly where to click in admin. Previously page was implicit-tech-knowledge gated; now it's a true visual reference.

#### Step 4x ✅ DONE — Frontend Master applied to /guidelines/seo-visual (font-size accessibility)
- [x] **User direction:** apply Frontend Master skill on the page
- [x] **Audit findings:** 81 tiny font instances using `text-[9px]` or `text-[10px]` across all 5 sections (SERP mockup · Rich Result · Before/After · Social Previews · Summary). Same accessibility issue as Prohibitions had.
- [x] **Fixes applied (2 global replace_all):**
  - All `text-[9px]` (9px) → `text-[11px]` (+22% size)
  - All `text-[10px]` (10px) → `text-xs` (12px, +20% size)
- [x] **Affected elements:** annotation row labels, code badges, breadcrumbs, sub-text, summary cards, callout footers
- [x] Visual verified via Playwright — text now readable for all ages
- [x] **Net effect:** the page that teaches "how your content appears in search" is itself now visually accessible — meta-rule fulfilled.

#### Step 4w ✅ DONE — Visual SEO Course renamed to "معاينة البحث والمشاركة"
- [x] **User feedback:** "كلمة الدليل البصري في الـ Sidebar مكانها غلط. الـ Media هي الدليل البصري الفعلي. غيّر مصطلح الدليل البصري لكلمة أوضح."
- [x] **AD reasoning:** "الدليل البصري" (visual guide) implies brand/design — but `/guidelines/seo-visual` is actually about SERP previews + social share previews. Confusing naming.
- [x] **New label:** "معاينة البحث والمشاركة" (Search & Share Preview) — specific + descriptive
- [x] **Updated 5 surfaces:**
  1. `hub-sidebar.tsx` — `الأدلة العملية` group label
  2. `guidelines/page.tsx` — `guidelineSections` array entry (title + description)
  3. `guidelines/page.tsx` — landing teaser card heading
  4. `seo-specialist/page.tsx` — footer quick-links label
  5. `seo-visual/page.tsx` — GuidelineLayout title + description
- [x] **Description rewrite:** "كيف يظهر مقالك في نتائج جوجل وعند مشاركته على WhatsApp / X / LinkedIn — تتبّع كل عنصر لمصدره في الأدمن"
- [x] Visual verification via Playwright — BEFORE/AFTER screenshots saved
- [x] (TSC skipped per global rule — small text-only edits)

#### Step 4u ✅ DONE — Frontend Master skill applied to Prohibitions page (UI/UX polish)
- [x] **User direction:** test Frontend Master skill, show before/after diff
- [x] **Audit per Frontend Master checklist (Part 6 UX rules + Part 3.5 Typography):**
  - ❌ All accordions collapsed → user lands on empty content (UX rule 7 violation)
  - ❌ RTL bidi rendering "محظورات Modonty —" had reversed dash position
  - ⚠️ Severity legend contrast (text-muted-foreground) too low for quick scanning
- [x] **3 fixes applied:**
  1. **First accordion auto-opens** — `defaultValue={d.categories[0] ? [d.categories[0].category] : []}` on Accordion. User now sees actual prohibitions immediately when landing on each tab.
  2. **Header bidi fix** — wrapped `Modonty` in `<span dir="ltr">` inside parent `<h2 dir="rtl">`. Title now reads correctly without dash artifacts.
  3. **Severity legend contrast** — `text-muted-foreground` → `text-foreground` + `font-medium`. Added vertical separator (`sm:border-s sm:border-red-500/20`). More legible at glance.
- [x] **Before/After verified** — Playwright screenshots saved to `.playwright-mcp/prohibitions-BEFORE.png` and `prohibitions-AFTER.png`
- [x] TSC admin: exit=0
- [x] **Net effect:** opening the Prohibitions page is now informative immediately — visitor sees the first 6-12 prohibitions per tab without clicking anything. Header reads correctly in RTL. Severity legend more scannable.

#### Step 4t ✅ DONE — SEO Technical re-audited + 3 missing items added (modonty-specific gaps)
- [x] **User direction:** "راجع SEO التقني. هل المعلومات صحيحة 100% حسب آخر التحديثات؟ وما هي النواقص؟" → "دي فناقص" (add the missing)
- [x] **Audit results:** 29 existing items verified against Google 2026 official sources (Manual Actions list, Structured Data policies, Hreflang docs, Mobile-First Indexing 2026 status). All current items accurate.
- [x] **3 new items added (modonty-specific gaps):**
  1. **Soft 404 — صفحة تعطي 200 لكن محتواها فارغ (medium)** — added to التقني category. Directly relevant to modonty's URL Lifecycle plan: archived/deleted articles must return 410 or proper 404, not 200 + "غير موجود" message.
  2. **Hreflang errors (medium)** — added to التقني category. Modonty serves Arabic + English content targeting SA + EG markets. 75% of multilingual sites have hreflang errors per industry data. Common errors: missing return links, wrong language codes, canonical conflicts.
  3. **Spammy Structured Data (high)** — added to Manual Penalty category. 🎯 Modonty-specific: auto-generates JSON-LD (Article + Person + Organization) for every published article. Any schema violation = manual action that disables Rich Results. References existing modonty memory rule "JSON-LD = code responsibility". Lists 3 specific violations: schema for hidden content · fake reviews/ratings · markup mismatching page content.
- [x] **Verified retired tools/policies:** Mobile Usability Report deprecated Dec 2023 (existing items still accurate — Mobile-First Indexing remains the ranking signal)
- [x] **Categories updated:**
  - التقني: 10 → 12 items (+Soft 404, +Hreflang)
  - Manual Penalty: 8 → 9 items (+Spammy Schema)
  - SEO Technical tab total: 29 → 32 items
- [x] TSC admin: exit=0
- [x] **Net effect:** SEO Technical tab is now complete reference for modonty's specific risks. The Spammy Schema item ties to existing memory rule (JSON-LD is auto-generated by code, any issue is a code bug not admin task). The Soft 404 item ties to active URL Lifecycle work. The Hreflang item addresses modonty's bilingual content for SA+EG markets.

#### Step 4s ✅ DONE — 5 Meta-specific creative ranking-killers added (designer prohibitions)
- [x] **User direction:** "بالنسبة لـ Facebook إيش الحاجات اللي تقلل من الـ Ranking أو إن الـ Creative يعمل viral؟ إيش الممنوعات اللي الواحد يتجنبها كـ designer؟" → "ضيف المعلومات التي تفيد"
- [x] **Sources verified (4 parallel searches):**
  - Meta Transparency Center — Engagement Bait policy
  - Meta Ad Specs 2026 (1080px minimum, blurry/stretched penalty)
  - Meta Original Content Rules 2026 (repetitive reposts policy)
  - Facebook Algorithm 2026 (clickbait + caption-content mismatch)
- [x] **5 new items added** to منصات النشر category (gap-filled — not previously covered):
  1. **Engagement Bait — التحريض على التفاعل (high)** — "اعمل لايك لو..."، "شير مع أصحابك"، "Tag صديق". Meta auto-demotes posts AND the page that repeats it
  2. **Clickbait / Caption-Content Mismatch (high)** — العنوان يعد بشيء، المحتوى يقدّم شيء تاني = early drop-offs = Meta lowers distribution
  3. **صور بدقة أقل من 1080px (medium)** — Meta Ad Specs 2026 minimum; smaller = pixelated in feed = auction penalty + higher CPM
  4. **تمدد صورة صغيرة (medium)** — pixelation kills delivery; better to use a simpler crisp image
  5. **إعادة نشر متكرر بدون تعديل (medium)** — Meta Original Content Rules 2026 reduces reach for re-posted same content
- [x] **Modonty filter applied:** all 5 items relevant to designers + video creators on the team. Skipped non-relevant Meta findings (e.g., political ad rules — modonty doesn't run political content)
- [x] **منصات النشر category total:** 7 → 12 items
- [x] **Brand tab total:** 19 → 24 items
- [x] TSC admin: exit=0
- [x] **Net effect:** modonty designers + video creators now have a complete reference for Meta-specific ranking signals — beyond the universal cross-platform rules. Each item ties to an official Meta source and explains the consequence in plain Arabic.

#### Step 4r ✅ DONE — Content+On-Page re-audited against 2025/2026 official Google sources
- [x] **User direction:** "راجع المحتوى والمقالات. هل المعلومات حسب آخر تعديل وحسب المصادر الرسمية؟"
- [x] **Sources verified (4 parallel WebFetch + WebSearch):**
  - https://developers.google.com/search/docs/fundamentals/creating-helpful-content (current Helpful Content criteria)
  - https://developers.google.com/search/docs/appearance/title-link (Meta Description + H1 stance)
  - WebSearch: "Google Helpful Content System update 2026" (March 2026 core update results)
  - WebSearch: "John Mueller AI content November 2025"
- [x] **6 corrections applied based on official 2026 sources:**
  1. **Thin Content** — Removed myth "أقل من 300 كلمة" (Google explicitly: "we don't have a preferred word count"). Reframed to focus on lack of value/expertise. Added reference to March 2026 core update which specifically targeted "thin content at scale".
  2. **AI Content** — Reframed per John Mueller's Nov 2025 official statement: "Our systems don't care if content is created by AI or humans. What matters is whether it's helpful for users." Issue is not AI itself but lack of human review + value + sourcing + transparency disclosure.
  3. **Meta Description duplicates** — Clarified NOT a direct penalty (Google rewrites duplicates). Reframed as snippet-opportunity loss.
  4. **Keyword Cannibalization** — Clarified NOT a manual penalty but a real quality issue. Added solution: merge or differentiate.
  5. **Missing H1** — Clarified Google does NOT require H1 (per official title-link docs). Reframed as best practice. Severity: high → medium.
  6. **Empty Alt Text** — Reframed as primarily accessibility issue (screen readers) + Google Images opportunity. Removed "55% of sites" stat (unverified). Severity: medium retained.
- [x] **Severities adjusted** to reflect reality (best-practice items at medium, real penalties at high/critical)
- [x] **Honesty principle applied:** the catalog now distinguishes between "ممنوع رسمياً يسبب عقوبة" (manual penalty) and "إشارة جودة سلبية" (quality signal that affects ranking gradually)
- [x] TSC admin: exit=0
- [x] **Net effect:** every Content+On-Page item now traces to current 2025/2026 official source, with myths removed (300-word minimum, H1 requirement) and severities calibrated to actual enforcement reality.

#### Step 4q ✅ DONE — منصات النشر — regulated goods item removed (modonty filter)
- [x] **User direction:** "ترويج منتجات منظّمة (كحول / تبغ / مقامرة / تشفير) هذا الموضوع ما يخص"
- [x] **Verified:** modonty's editorial publishing model never deals with alcohol/tobacco/gambling/crypto promotion. Content irrelevant.
- [x] Removed item from منصات النشر category. Final count: 7 items (was 8).
- [x] Brand tab total: 19 items (6 Logo + 6 Video + 7 Platforms)
- [x] TSC admin: exit=0

#### Step 4p ✅ DONE — Platform creative rules added (TikTok · Meta · Snap · Instagram · 2026)
- [x] **User direction:** "نضيف قسم جديد من الممنوعات — rules تبع المنصات (TikTok · Snap · Meta · Facebook · Instagram). إيش rules تبعتهم في الـ creative؟ آخر update"
- [x] **Research executed (4 parallel WebFetch + WebSearch on official sources):**
  - Meta transparency.meta.com (Community Standards verified)
  - Snapchat values.snap.com Community Guidelines
  - TikTok Community Guidelines via WebSearch (ai-generated content disclosure 2026 + branded content tags)
  - Meta Branded Content 2026 update (Paid Partnership tag now mandatory, "Deceptive Practice" classification)
- [x] **AD architectural decision:** added as NEW category WITHIN الهوية البصرية tab (not new top-level tab) — keeps the 3-tab UX clean while grouping all creative-related prohibitions
- [x] **8 new platform creative rules** verified from official 2026 sources:
  1. **AI content بدون label (critical)** — TikTok removed 51K AI videos without label in H2 2025; Meta requires "AI-generated" tag
  2. **محتوى للعميل بدون "Paid Partnership" tag (critical)** — Meta 2026 classifies UGC-style ads without tag as "Deceptive Practice"
  3. **Copyright music/video/images (critical)** — 3 strikes = permanent account closure on YouTube/Meta
  4. **Deepfakes / Manipulated Media (critical)** — banned across all platforms regardless of disclosure for public figures in degrading contexts
  5. **انتحال هوية / علامة تجارية (critical)** — Meta + TikTok have rapid brand reporting systems
  6. **ادعاءات صحية بدون مصدر (high)** — KSA SFDA + EGY EDA approval required for health claims
  7. **شراء followers / engagement (critical)** — automated detection across all linked accounts
  8. **منتجات منظّمة (alcohol/tobacco/gambling/crypto)** (critical) — Snapchat + TikTok blanket ban; even casual mention triggers removal
- [x] **Filter updated:** brand tab now matches "العلامة التجارية" || "الفيديو" || "منصات النشر" (3 categories now appear in الهوية البصرية tab)
- [x] **Brand tab sublabel updated:** "Brand & Video" → "Brand · Video · Platforms"
- [x] **Tab item count auto-updates** to 20 (was 12: 6+6+8 from new category)
- [x] **Icons:** added `Share2` lucide icon for the new category (universally recognizable as "social/sharing")
- [x] TSC admin: exit=0
- [x] **Net effect:** modonty's 2 video creators + 3 designers now have a single source of truth for "what's forbidden when posting on social media platforms in 2026". Each rule traces to an official platform policy + Saudi/Egyptian regional regulation where applicable.

#### Step 4o ✅ DONE — Prohibitions readability boost (font sizes + spacing fixed)
- [x] **User feedback:** "الخط صغير. أنا لا أستطيع القراءة. مثلاً، 'تمدد اللوغو أفقياً ورأسياً' — العنوان والوصف صغيرين"
- [x] **Audit of font sizes (BEFORE):**
  - Item title (item.name): `text-xs` = **12px** ❌ too small
  - Item description (item.consequence): `text-[10px]` = **10px** ❌❌ way too small
  - Severity badge: `text-[8px]` = **8px** ❌❌❌ unreadable
  - Severity legend label: `text-[9px]` = 9px
  - Tab sublabel: `text-[10px]` = 10px
  - Accordion category title: `text-xs` = 12px
  - Footer note: `text-xs` = 12px
- [x] **AFTER (boost across all readable text):**
  - Item title: **16px** (`text-base`) + bold + `text-foreground` (was muted)
  - Item description: **14px** (`text-sm`) + leading-relaxed
  - Severity badge: **11px** (`text-[11px]`) + font-semibold
  - Severity legend: **12px** (`text-xs`)
  - Tab sublabel: **12px** (`text-xs`)
  - Tab item count: **12px** (`text-xs`)
  - Tab main label: **16px** (`text-base`)
  - Accordion category title: **16px** (`text-base`)
  - Header title: **18px** (`text-lg`)
  - Header description: **14px** (`text-sm`)
  - Footer note: **14px** (`text-sm`)
- [x] **Spacing improvements:**
  - Item card padding: `p-3` → `p-4` (more breathing)
  - Item card spacing: `space-y-1.5` → `space-y-3` (clear separation between title and description)
  - Severity dot size: `w-1.5 h-1.5` → `w-2.5 h-2.5` (more visible)
  - Header icon: `h-4 w-4` → `h-5 w-5`
  - Tab icon: `h-4 w-4` → `h-5 w-5`
  - Accordion py: `py-4` → `py-5`
  - Accordion content pb: `pb-5` → `pb-6`
- [x] **Layout improvement:** grid `xl:grid-cols-3` → `lg:grid-cols-2` — only 2 cards per row max, leaves space for larger fonts to render properly without truncation
- [x] **Severity legend on header:** `flex-wrap` added so it doesn't overflow on narrow widths
- [x] **Mobile-friendly:** sublabel hidden on small screens (`hidden sm:inline`) so item count badge stays visible
- [x] TSC admin: exit=0
- [x] **Net effect:** every element on the page is readable for all ages including readers with imperfect vision. The user's specific complaint about "تمدد اللوغو" item is resolved — title now 16px bold, description 14px relaxed.

#### Step 4n ✅ DONE — Prohibitions copy simplified to non-technical Arabic
- [x] **User direction:** "خلِ الصياغة بسيطة، بحيث حتى الشخص مش technical يفهم المطلوب"
- [x] **Approach:** Reviewed all 58 items across 8 categories. Pattern applied to every item:
  - **Name field:** keeps technical English term (e.g., "Canonical", "LCP", "INP") because that's what shows in admin tools — but adds short plain-Arabic clarification in parentheses
  - **Consequence field:** rewritten in everyday Arabic. Removed jargon: "Crawl Budget · render · Googlebot · GSC Coverage · MetaUX · ranking signals · Penguin · Panda · Schema". Replaced with analogies and plain explanations.
- [x] **Examples of simplification:**
  - Before: "تعارض مباشر — جوجل يتجاهل الصفحة كلياً وتختفي من نتائج البحث"
  - After: "الـ Canonical يقول لجوجل 'هذي الصفحة الأصلية، اعرضها'. والـ noindex يقول 'لا تعرضها'. الاثنين معاً يربكوا جوجل، فيتجاهل الصفحة كلياً"
  - Before: "يهدر الـ Crawl Budget ويُشوّش Googlebot — GSC ينبّه عليه في Coverage"
  - After: "جوجل يضيّع وقته على صفحات لن تظهر"
  - Before: "intro طويل = خسارة 50%+ من المشاهدين قبل الـ hook"
  - After: "مقدمة طويلة (logo reveal، fade-in) = خسارة نص المشاهدين قبل ما يوصلوا للمحتوى الفعلي"
- [x] **Categories rewritten:** Brand & Logo (6) · Video (6) · Technical (10) · Content (11) · On-Page (6) · Backlinks (7) · Manual Penalty (8) · UX (4)
- [x] **Audience served:** designers, video creators, content writers, new joiners — all can now read and act on the catalog without needing SEO background knowledge
- [x] TSC admin: exit=0
- [x] **Net effect:** the page is now a true team-wide reference. A designer who never read SEO docs can still understand why "صفحة بدون H1 واضح" hurts the site, in plain Arabic.

#### Step 4m ✅ DONE — Prohibitions audited against official Google docs + modonty-specific filter
- [x] **User direction:** "تراجع كل بند، وتطابقه بالمصادر الرئيسية الرسمية. اجعل التحديثات تخص مدونتي — لا أحتاج معلومات لا تفيد مدونتي"
- [x] **Sources verified (5 official Google docs via WebFetch):**
  - https://developers.google.com/search/docs/essentials/spam-policies (20 spam policies)
  - https://web.dev/articles/vitals (LCP/CLS/INP thresholds + INP replaced FID 2024)
  - https://developers.google.com/search/docs/appearance/page-experience (HTTPS/mobile/interstitials/ad density)
  - https://developers.google.com/search/docs/crawling-indexing/canonicalization-troubleshooting
  - https://developers.google.com/search/docs/crawling-indexing/robots/intro
- [x] **🚨 Critical fix:** Removed "Bounce Rate" item from UX category — Google has publicly denied using bounce rate as a ranking signal (was a wrong claim)
- [x] **⚠️ Terminology fix:** "Thin Content" consequence — replaced outdated "Panda algorithm" reference with "Helpful Content System" (Google's current core algorithm system since 2022)
- [x] **🆕 4 modonty-relevant additions** (filtered against modonty's editorial publishing model — skipped fake-generators/malware/automated-link-building/widget-distribution/ad-density which don't apply):
  - **Content category:** "انتهاك حقوق النشر — Copyright / DMCA" (Legal Removals policy) + "نشر معلومات شخصية بدون موافقة" (Personal Information Removals policy) — both critical for editorial team
  - **Backlinks category:** "Low-Quality Directory & Bookmark Links" (Link Spam policy) — relevant when SEO team builds backlinks for modonty
  - **UX category:** "غياب HTTPS — Page Experience Signal رسمي" — replaces removed Bounce Rate item, references that modonty already has HTTPS
- [x] **🎯 Modonty-specific rewrite:** "Site Reputation Abuse" / Parasite SEO item completely rewritten to address modonty's exact business model: "النموذج التشغيلي = نشر محتوى للعملاء على دومين مودونتي" + 3 protection rules (editorially overseen + clearly attributed + genuine value)
- [x] **Final catalog:** 58 verified prohibition items (was 55, net +3 after removal/addition)
- [x] TSC admin: exit=0
- [x] **Net effect:** every item now traces to an official Google policy (or is internal brand discipline). Modonty-irrelevant items (fake generators, malware, widget distribution) intentionally excluded per user filter. Content writers + SEO team get team-relevant prohibitions only.

#### Step 4l ✅ DONE — Prohibitions UX redesigned with 3 discipline tabs
- [x] **User feedback:** "الـ UX مش أحسن حاجة. قسمهم حسب الـ نوع — هوية بصرية لوحدها، article لوحدها"
- [x] **AD problem statement:** 8 categories in flat accordion = cognitive overload. Designer scrolls past 6 SEO categories to find brand. Visitor doesn't know where their concern lives.
- [x] **AD solution:** 3 discipline tabs at top with role-color identity:
  - 🎨 **الهوية البصرية** (violet · 12 بند) → Brand + Video categories
  - 📝 **المحتوى والمقالات** (emerald · 15 بند) → Content + On-Page categories
  - 🔧 **SEO التقني** (amber · 28 بند) → Technical + Backlinks + Manual Penalty + UX categories
- [x] **Tab UX details:**
  - Each TabsTrigger shows discipline icon + Arabic label + English sublabel + live item count badge
  - Active tab gets discipline-specific color (violet/emerald/amber) for visual identity
  - Default tab: `brand` (designer audience matches user's emphasis on brand prominence)
  - 3-column grid divide-x for clean visual separation
- [x] **Filter logic:** category names matched by Arabic keyword `c.category.includes(...)` — clean, no need to refactor `seoProhibitions` data shape
- [x] **Header subtitle updated:** "مقسّم حسب التخصص. اختر التبويب الذي يخصك."
- [x] **Severity legend retained** (top-right) — visible on all tabs
- [x] **Footer severity definitions retained** (bottom) — visible on all tabs
- [x] Added imports: `Tabs/TabsList/TabsTrigger/TabsContent` + `Palette` + `Wrench` icons
- [x] TSC admin: exit=0
- [x] **Net effect:** designer/video creator opens Prohibitions → already on their tab. Content writer clicks "المحتوى". SEO specialist clicks "SEO التقني". Each role sees only their relevant ~12-28 items instead of overwhelming list of 55.

#### Step 4k ✅ DONE — Prohibitions transformed into team-wide catalog (SEO + Brand + Video unified)
- [x] **User direction:** "خليها مرجع لكل الممنوعات، سواء ممنوعات في الـ article أو ممنوعات في الـ designing — حتكون مهمة للـ team كامل"
- [x] **AD architectural shift:** Prohibitions page evolved from SEO-only catalog → unified Modonty cross-discipline reference. Single page that any new team member opens to learn "what's forbidden across our entire workflow"
- [x] **Added 2 new categories** at top of `seoProhibitions` array (designer + video maker domains):
  - 🎨 **العلامة التجارية واللوقو** — 6 violations (تمدد · تدوير · container · عكس [critical] · إعادة تلوين · تشويه)
  - 🎬 **الفيديو** — 6 violations (license [critical] · long intros · small text · auto-play · unsourced claims · external watermarks)
- [x] **Severity assigned** with reasoning: critical for legal/identity-breaking (license, mirror logo); high for brand consistency violations; medium for distribution-impacting (watermarks)
- [x] **Headers updated:**
  - Page title: "محظورات SEO" → "محظورات Modonty — كل ما هو ممنوع عبر الفريق"
  - GuidelineLayout title: "الممنوعات — SEO Prohibitions" → "الممنوعات — Modonty Prohibitions"
  - Subtitle reflects multi-discipline scope
  - navbar tooltip: "ما يُضعف موقعك أو يحذفه من جوجل" → "المرجع الموحّد لكل ممنوعات Modonty — SEO · Brand · Video"
  - Landing grid description: "(50+ مخالفة)" → "SEO · Brand · Video (60+ مخالفة)"
  - SEO Specialist callout text updated to reference the unified catalog
- [x] **Media page cleanup (2 inline DON'Ts grids → 2 prominent red callouts):**
  - Logo card: 6-item DON'Ts grid → red callout "❌ ممنوعات اللوقو · 6 محظورات في صفحة الممنوعات الموحّدة → عرض القائمة الكاملة"
  - Video card: 6-item Forbidden grid → red callout "❌ ممنوعات الفيديو · 6 محظورات (license · intros طويلة...) → عرض القائمة الكاملة"
  - Added `Link` import to media page
  - Clearspace amber notice retained (it's positive guidance, not prohibition)
- [x] **Total prohibitions catalog:** 6 categories · 60+ items (was 6 categories · 50+ SEO items)
- [x] TSC admin: exit=0
- [x] **Net effect:** anyone opening `/guidelines/prohibitions` sees a comprehensive cross-discipline reference. Designer prohibitions, video maker prohibitions, SEO prohibitions — all in one place, sorted by severity, navigable from every page via the navbar button.

#### Step 4j ✅ DONE — Prohibitions promoted to navbar + sub-page duplication purged
- [x] **User direction:** "شيلها من الـ sidebar، وحطها في الـ navbar — جدًا مهمة. وأجرد الصفحات الممنوعات اللي موجودة فيها، نشيلها من الصفحات الداخلية، تأكد ما في تكرار."
- [x] **Audit results (4 sub-pages with prohibition-style language):**
  - **media** — Logo DON'Ts + Video Forbidden = brand/craft discipline (not SEO). KEEP — different domain.
  - **articles** — writer SEO do/dont pairs = instructional teaching format (not catalog). KEEP.
  - **seo-specialist** — Technical pillar's `الأخطاء الصامتة القاتلة` sub-section (6 rules: Canonical+noindex, www-vs-non-www, Noindex-in-Sitemap, Orphan Pages, Duplicate Content, Canonical-to-redirect) = **100% duplicate with Prohibitions Technical category**. PURGE.
  - **authors/clients/organization/subscribers/tracking/seo-visual** — no prohibition content. nothing to do.
- [x] **Navbar promotion:** Modonty header (sticky, global on every guideline page) now has prominent red button with XCircle icon → `/guidelines/prohibitions`. Logo wrapped in Link to `/guidelines`. Hover state intensifies. Title attribute "ما يُضعف موقعك أو يحذفه من جوجل".
- [x] **Removed:** Prohibitions item from hub-sidebar الأدلة العملية group + `XCircle` import
- [x] **SEO Specialist surgery:**
  - Removed entire `الأخطاء الصامتة القاتلة` sub-section from Technical pillar (6 duplicate rules · ~50 lines)
  - Added `XCircle` import + replaced AlertCircle (no longer used)
  - Added prominent red callout block right after Pillars summary bar: "للقائمة الكاملة لمحظورات SEO وعقوباتها → 50+ مخالفة موثّقة من سياسات Google الرسمية" with arrow link to Prohibitions
- [x] TSC admin: exit=0 (after fixing one duplicate XCircle import issue)
- [x] **Net effect:** Prohibitions accessible from EVERY guideline page (navbar) instead of buried in landing grid. Zero SEO content duplication across all sub-pages.

#### Step 4i ✅ DONE — Prohibitions migrated to new `/guidelines/prohibitions` sub-page (landing now anchor-free)
- [x] **User direction:** "اعمل صفحة للممنوعات" + expert mode
- [x] **Created:** `admin/app/(public)/guidelines/prohibitions/page.tsx` (214 lines)
  - Full `seoProhibitions` array (6 categories · 50+ violations) with severity Severity enum + severityConfig + types/interfaces
  - Same Accordion + severity legend (critical/high/medium with colored dots) + footer summary
  - Wrapped in `<GuidelineLayout title="الممنوعات — SEO Prohibitions" description="..." />`
- [x] **Removed from landing:** types/interfaces · severityConfig · seoProhibitions array · entire Prohibitions Card render block · `#prohibitions` anchor from hub-sidebar
- [x] **Removed entire "في هذه الصفحة" group from hub-sidebar** — last anchor gone, group obsolete (was already empty after SEO Specialist migration except for #prohibitions)
- [x] **Added:** new `prohibitions` entry in `guidelineSections` grid (red theme + XCircle icon · 50+ violations description) · new sub-page link in الأدلة العملية group
- [x] **Cleaned 9 unused imports** from landing (Accordion, AccordionContent, AccordionItem, AccordionTrigger, Hash, Link2, Cpu, Activity, AlertCircle) + replaced AlertCircle with XCircle in hub-sidebar
- [x] **Final landing size:** 1224 → **204 lines (−1020 lines, −83%)**. Landing is now PURE navigation: header + Visual SEO Course teaser + 10-entry sub-pages grid. Zero embedded content, zero anchors.
- [x] **Final hub-sidebar:** 2 groups only (الأدلة العملية with 10 sub-pages · قريباً with 7 placeholders). الأنكر group removed.
- [x] TSC admin: exit=0
- [x] **Final architecture:** 4 specialized sub-pages own their content (`media`, `articles`, `seo-specialist`, `prohibitions`). Landing = pure navigation hub. Zero duplication anywhere.

#### Step 4h ✅ DONE — SEO Specialist content MIGRATED to new `/guidelines/seo-specialist` sub-page
- [x] **User direction:** "كمل على الـ SEO" + expert mode ("اعتبر نفسك خبيراً، فكر بدماغي")
- [x] **Scale of migration:** 475+ lines of constant data (`seoPillars` + `seoTools`) + 155-line render block — biggest single migration in this session
- [x] **Created:** `admin/app/(public)/guidelines/seo-specialist/page.tsx` (538 lines)
  - Full `seoPillars` (Technical · On-Page · Off-Page) with all sub-sections + do/dont rules
  - Full `seoTools` (8 categorized groups · 40+ tools with URLs/tags)
  - Same Accordion + Pillars summary bar + Tools accordion item + Footer quick links UX
  - Wrapped in `<GuidelineLayout title="SEO Specialist" description="..." />` for breadcrumb consistency
- [x] **Removed from landing:** `seoPillars` + `seoTools` constants · entire SEO Specialist Card render block · `#seo` anchor from hub-sidebar
- [x] **Added:** new `seo-specialist` entry in `guidelineSections` grid (amber theme + TrendingUp icon + 40+ tools description) · new sub-page link in hub-sidebar الأدلة العملية group
- [x] **Cleaned 13 unused lucide imports** from landing (PenLine, CheckCircle2, AlignLeft, Users, Bot, UserCheck, ExternalLink, Wrench, Star, DollarSign, Tag, Factory, Code2)
- [x] **Final landing size:** 1224 → 386 lines (−838 lines, **−68%**). Landing is now lean: header + Prohibitions + Visual SEO Course teaser + sub-pages grid (9 entries)
- [x] TSC admin: exit=0
- [x] **Net architecture:** 3 specialized sub-pages (`media`, `articles`, `seo-specialist`) own their respective role content. Landing is pure navigation hub + role-agnostic Prohibitions. Zero duplication across 3 roles.

#### Step 4g ✅ DONE — Writer SEO rules MIGRATED to /guidelines/articles (not just deleted)
- [x] **User direction:** "نفس اللي عملناه لما يخص المصمم لكاتب المحتوى" + "اعتبر نفسك خبيراً، فكر بدماغي، شوف اللي صح، اعمل"
- [x] **Critical audit before action:** Writer's `seoSections` (4 collapsible groups · 12 do/dont rules covering Title/Excerpt/Slug/H2-H3/Keywords/Length/SEO meta/Internal links/Alt text) was NOT mirrored in `/guidelines/articles` — landing was the ONLY source. Pure deletion would lose the rules.
- [x] **Migration to `/guidelines/articles`:**
  - Added `seoWritingRules` const (full content port, identical structure)
  - New "قواعد الكتابة لـ SEO — للكاتب" Card (emerald theme · PenLine icon · Content Writer badge) appended after SEO Checklist
  - Accordion (multiple) with 4 collapsible sub-sections — same icon+color discipline (emerald/violet/blue/amber)
  - Footer note kept (links Basic/Content/SEO admin steps)
- [x] **Removed from landing:** `seoSections` const · Writer Card · `#writer` anchor from hub-sidebar · `PenLine` import from hub-sidebar · `ArrowLeft` from landing imports (was only used by deleted card footers)
- [x] Kept in landing: `Hash`, `AlignLeft`, `PenLine` (still used by `seoPillars` + `seoTools` arrays for SEO Specialist card — verified before keeping)
- [x] TSC admin: exit=0
- [x] **Net effect:** /guidelines landing is now lean — only navigation header + SEO Specialist card + Prohibitions card + Visual SEO Course card + sub-pages grid. Designer content lives in `/guidelines/media`. Writer content lives in `/guidelines/articles`. Zero duplication.

#### Step 4f ✅ DONE — Designer content removed from /guidelines landing (no duplication with Media page)
- [x] **User direction:** "نظف الـ Dashboard الرئيسية، مما يخص المصمم. شيله من هنا، خلاص ما نحتاجه. بس راجع قبل ما تشيل."
- [x] **Audit before deletion:**
  - `designerRules` array (5 rules) — 100% mirror of media specs already in `/guidelines/media`
  - "للمصمم" Card (anchor `#designer`) — duplicate display of those 5 rules + footer link to media page
  - Hub sidebar `#designer` anchor — would point to nothing after card removal
  - `Palette` icon — used only inside the deleted card
  - Visual SEO Course card + `guidelineSections.media` — KEEP (not designer-specific, navigation only)
- [x] **Removed:** `designerRules` array · entire designer Card block · `#designer` anchor link from hub sidebar · `Palette` import from both files
- [x] TSC admin: exit=0

#### Step 4e ✅ DONE — Video guidelines added to Media page (single focused card)
- [x] **AD call:** ONE Video card (not separate page, not 3 cards) — same Collapsible + amber discipline pattern
- [x] **Format Matrix table** — 4 channels (Hero/Web · Article · Reels-TikTok-Shorts · Feed) with ratio + duration cap + resolution + codec
- [x] **The 3-Second Rule** — featured amber callout (Zap icon) — the AD's core wisdom: "ابدأ بالـ hook مباشرة — لا logo intros · لا fade-ins"
- [x] **3 mini-cards** — Brand (logo+colors+fonts) · Captions (RTL Arabic mandatory, 85% silent viewers) · Safe Zone for 9:16 (top 10% + bottom 15% reserved for platform UI)
- [x] **6-item forbidden grid** — license · long intros · small text · auto-play sound · unsourced claims · external watermarks
- [x] Added imports: `Film`, `Zap` from lucide-react · TSC admin: exit=0

#### Step 5 ⏳ PENDING — Next consolidation (Articles? Authors? user picks)

#### Step 3 ⏳ PENDING — Sales + Marketing
#### Step 4 ⏳ PENDING — Team + Golden Rules
#### Step 5 ⏳ PENDING — Polish + admin sidebar link
- [ ] Layout: full Dashboard with persistent sidebar (per Khalid's better
      proposal — replaces "landing-with-cards" idea)
- [ ] Landing = narrative onboarding for a new employee (what Modonty IS,
      services, philosophy, 3-layer architecture, ICPs, competitive edge)
- [ ] Sidebar = role-based + topical sections, all reading from synthesis
- [ ] Public route — accessible without auth (existing `(public)/guidelines/`
      pattern in admin app already supports this)
- [ ] Replaces current /guidelines landing with new Dashboard-style layout

---

## 📊 Admin Analytics Page (`/analytics`) — Coverage Gaps & Enhancement Backlog
> **Audit date:** 2026-05-01 · Source: code review of `admin/app/(dashboard)/analytics/`
> **Current data source:** MongoDB `Analytics` collection (in-house tracking only — NOT Google Analytics, NOT GSC). Records created on article views via `modonty/app/api/articles/[slug]/view/route.ts`, then PATCH-updated with behavior metrics via `modonty/app/api/track/analytics/[id]/route.ts`.

### ANL-01 🟡 MEDIUM — Page-type coverage gap (only article views tracked)
- **Issue:** the analytics page reports **only article views**. Visitors hitting `/`, `/categories`, `/tags`, `/authors`, `/clients`, `/industries` are completely invisible. We're under-counting reach by potentially 30-50%.
- **Why:** `db.analytics.create()` is called in exactly ONE place — the article view route. Other pages have zero tracking.
- **Fix scope:** add a generic page-view tracker (e.g. middleware + a tracker component) that POSTs to a single `/api/track/page-view` endpoint with pageType (article/category/tag/home/...) + slug. Schema already supports it via `articleId` being optional — just need a `pageType` + `pageSlug` field, or a separate `PageView` collection.
- **Decision pending:** include in `Analytics` model with optional articleId, OR create a separate `PageView` model? (Latter cleaner; former easier to aggregate.)

### ANL-02 🟡 MEDIUM — UI filter for client/article missing
- **Issue:** the server action `getAnalyticsData()` already accepts `{ clientId, articleId, startDate, endDate }`. But the UI exposes only date range — no client picker, no article picker.
- **Effect:** admin can't drill into "show me Kimazone-only" or "show me article X engagement" without writing code.
- **Fix scope:** add 2 dropdowns (client multiselect + article picker scoped to selected client) + wire to filter state already supported by `AnalyticsPageClient`.

### ANL-03 🟡 MEDIUM — `categorizeSource()` is too coarse for 2026 traffic patterns
- **Current logic:** [admin/.../get-analytics-data.ts:33](admin/app/(dashboard)/analytics/actions/get-analytics-data.ts#L33)
  - Direct / Organic / Social / Paid / Email / Referral — 6 buckets
- **Modern blind spots:**
  - ❌ Google Discover (ranks differently from Google Search)
  - ❌ AI search referrers (ChatGPT, Perplexity, Claude, Gemini, You.com)
  - ❌ UTM tracking (utm_source/utm_medium/utm_campaign — captured nowhere)
  - ❌ Internal navigation (modonty.com → modonty.com counts as Direct)
- **Fix scope:** extend categorizer + capture utm_* params on view tracking + add buckets `AI Search` / `Discover` / `Internal`.

### ANL-04 🟡 MEDIUM — Date range needs preset buttons + comparison vs previous period
- **Issue:** only manual date picker. No quick "Last 7d / 30d / 90d / This year" presets.
- **Issue:** no comparison data (e.g., "Views this week vs last week — +17%"). Dashboard root page already does this — analytics page doesn't.
- **Fix scope:** add preset chips + compute previous-period delta in `getAnalyticsData()`.

### ANL-05 🟢 LOW — Captured but not displayed: Core Web Vitals (LCP/CLS/INP)
- **Captured:** `Analytics.lcp` / `Analytics.cls` / `Analytics.inp` updated by client tracker on real visitors (RUM)
- **Displayed:** nowhere on `/analytics` — wasted data
- **Fix scope:** add a CWV widget showing p75 LCP/CLS/INP per article (matches Google's Core Web Vitals report style). Real-user metrics are more valuable than lab data.

### ANL-06 🟢 LOW — Captured but not displayed: device + geo breakdowns
- **Captured:** `userAgent` (every record) + `ipAddress` (every record)
- **Displayed:** neither shown
- **Fix scope:**
  - Device split (mobile/tablet/desktop) — parse userAgent (we already do this in console's analytics deep-dive — port the helper)
  - Geo (country / city) — call ip-api.com (already integrated in `modonty/lib/telegram/geo.ts`); cache per-IP per-day
- Big strategic value for ad-targeting + content localization decisions.

### ANL-07 🟢 LOW — New vs Returning visitors split
- **Possible from existing data:** `sessionId` count per visitor over rolling window
- **Currently:** not surfaced
- **Fix scope:** group by sessionId, label as "returning" if >1 session in last 30d
- Same logic exists in console's analytics deep-dive — port it.

### ANL-08 🟢 LOW — Conversion tracking exists in DB but not on this page
- **Observation:** there's a `Conversion` model + `lib/conversion-tracking.ts` already firing across modonty (subscribers, contact, news, register). Console dashboard uses it. Admin `/analytics` does NOT.
- **Fix scope:** add a "Conversions in window" KPI + breakdown by conversion type.

### ANL-09 🟢 LOW — Hardcoded read limits could miss data
- `take: 10000` in `getAnalyticsData()` and `take: 50000` in `getViewsTrendData()`.
- Acceptable now (low traffic) but ticking time-bomb at scale. Should switch to MongoDB aggregation pipelines (`$group` server-side) for KPIs instead of pulling rows to JS.

### ANL-10 🟢 LOW — `bounced` definition is unclear (doc-rot risk)
- **Issue:** field is set by client-side tracker, but the rule for "bounced" isn't documented anywhere. Different teams may interpret differently (single-page session? <30s? no-scroll?).
- **Fix scope:** document the rule next to the schema + add a tooltip on the bounce-rate KPI explaining how it's measured.

---

## 🐛 Rawan's Reported Bugs (Session 76 — 2026-04-30)

### RWN-01 ✅ DONE — "تم تعديل المقال بواسطة مستخدم آخر" false positive (optimistic locking)
- [x] **Root cause:** `updateArticle` compared `updatedAt` for conflict detection. SEO regen / JSON-LD storage / cron jobs bump `updatedAt` without being a user edit, so legitimate user saves were rejected immediately after any system write.
- [x] **Fix:** added `userVersion Int @default(0)` to Article model — bumped ONLY by user-initiated saves (`updateArticle`). `updatedAt` kept for display only.
- [x] **Sub-bug fixed during live test:** Prisma `{ increment: 1 }` is a silent no-op on MongoDB documents that don't yet have the field. Switched to explicit `set` using `(existingArticle.userVersion ?? 0) + 1`.
- [x] **Backfill (DEV):** `$set userVersion: 0` on all 29 existing DEV articles. **PROD backfill pending before push.**
- [x] **Live tests on DEV (admin):**
  - Plain save → userVersion 0→1 ✅
  - System bumped `updatedAt` mid-edit → user save still succeeded (was Rawan's exact scenario) ✅
  - Other-user changed `userVersion` → save correctly blocked ✅
- [x] **Files:** [update-article.ts](admin/app/(dashboard)/articles/actions/articles-actions/mutations/update-article.ts) · [article-form-context.tsx](admin/app/(dashboard)/articles/components/article-form-context.tsx) · [transform-article-to-form-data.ts](admin/app/(dashboard)/articles/helpers/article-form-helpers/transform-article-to-form-data.ts) · [article-server-schema.ts](admin/app/(dashboard)/articles/actions/articles-actions/article-server-schema.ts) · [form-types.ts](admin/lib/types/form-types.ts) · [schema.prisma](dataLayer/prisma/schema/schema.prisma)
- [x] TSC admin: zero errors.

### RWN-02 ⏳ PENDING — Slug edit blocked at 60+ chars on published articles
- Reported by Rawan; not yet reproduced/fixed. Needs live diagnosis.

### RWN-03 ⏳ PENDING — Adding links blocked due to "edited by another user"
- Likely fully resolved by RWN-01 (same root cause: SEO regen bumps `updatedAt`). Needs live confirmation.

### RWN-04 ⏳ PENDING — Form fields hang on navigation (UX)
- Reported by Rawan; not yet diagnosed.

---

## 🎨 Toast UX Overhaul (Session 76 — 2026-04-30)

### TOAST-01 ✅ DONE — Admin toast clarity + transparency + employee-friendly
- [x] **Problem:** toast appeared and disappeared too fast; close button hidden until hover; transparent background washed out on busy pages.
- [x] **Decision:** Plan A (improve config of existing libraries) over Plan B (migrate admin to sonner). Avoids 68-file migration. Each app keeps its current stack.
- [x] **Admin (`@/hooks/use-toast` + custom Radix Toaster):**
  - 6px solid tone-coded left border (emerald/red/amber/blue) — instant visual recognition
  - Always-visible close button (was opacity-0 until hover) + bigger hit target + Arabic `aria-label`
  - Icon now sits in a 36px tinted ring (bg-emerald-500/15 + ring-emerald-500/30) for visual hierarchy
  - Title: `font-bold` + tight leading; Description: full opacity + relaxed leading + spacing
  - Action button moved below description in flex layout (was overflowing on narrow toasts)
  - Per-variant durations: success 6s · warning 8s · error 12s · info/default 5s (was all 4s/10s)
- [x] **Console (`sonner`):**
  - `closeButton` always visible · `expand` (stack expanded by default for readability) · `visibleToasts: 3`
  - Custom classNames: bold title · muted-foreground description · close button forced to right side (was breaking in RTL `start: auto, end: 2`)
  - `border-2 shadow-xl` for prominence on light theme · 64px min-height · 14/16px padding
  - Default duration 4s → 5s
- [x] **Files:** [admin/components/ui/toast.tsx](admin/components/ui/toast.tsx) · [admin/components/ui/toaster.tsx](admin/components/ui/toaster.tsx) · [admin/hooks/use-toast.ts](admin/hooks/use-toast.ts) · [console/app/components/providers/toast-provider.tsx](console/app/components/providers/toast-provider.tsx)
- [x] **TSC:** admin=0 · console=0
- [x] **Decision rule applied:** kept sonner for non-blocking feedback (success/info) · shadcn AlertDialog stays the right tool for destructive confirmations (delete/publish/push) — already in stack, no migration.
- [x] **Process rule added:** all Playwright screenshots must save inside `.playwright-mcp/` (filename param prefixed) so root stays clean.

---

## 🧹 Repo Cleanup (Session 73 — 2026-04-29)

### CLEAN-01 🟡 PARTIAL — `test-prisma-connection.ts` محذوف · Atlas rotation معلّقة
- [x] حُذف من الـ working tree (2026-04-29)
- [ ] ⚠️ لا يزال في git history (commit `493d4e5`) — قرار المستخدم: تأجيل لحين تغيير Atlas account
- [ ] **معلّق:** غيّر MongoDB Atlas password متى ما تجهز + حدّث 3 ملفات `.env.local` + Vercel envs

### CLEAN-02 ✅ DONE — Build cache cleanup (وفّر ~1.4 GB)
- [x] حُذف `admin/.next/` (975 MB) + `modonty/.next/` (376 MB) + `console/.next/`

### CLEAN-03 ✅ DONE — Test artifacts
- [x] حُذف `test-results/` + `modonty/test-results/` + `admin/logs/`
- [x] حُذف `modonty/performance-home.png`
- [x] حُذف `test-screenshots/` (14 MB · 178 ملف)

### CLEAN-04 ✅ DONE — Backups مقلّصة لآخر 5
- [x] من 16 → 5 احتياطيات (وفّر ~19 MB)

### CLEAN-05 ✅ DONE — Scripts قديمة مؤرشفة
- [x] `admin/scripts/` → 20 script منقولة إلى `documents/_archive/old-scripts/admin/`
- [x] `modonty/scripts/` → 12 script منقولة إلى `documents/_archive/old-scripts/modonty/`
- [x] `scripts/fix-broken-slug.mjs` محذوف (نسخة مكررة من .ts)
- [x] `admin/check-db.ts` + `admin/verify-db.ts` محذوفة

### CLEAN-07 ✅ DONE — تنظيف `documents/_archive/` (شامل + إلغاء)
- [x] **Phase 1 (HIGH):** 10 ملفات stub/duplicate/raw-output
- [x] **Phase 2 (MEDIUM):** 9 pipeline/UI snapshots + مجلد `old-scripts/` كامل (31 ملف)
- [x] **Phase 3 (one-time reports):** 31 ملف summaries/worklogs/reviews/migration guides
- [x] **Phase 4 (flatten + review):** subdirs منبسطة + حذف 48 ملف PRDs/audits/plans لميزات منفّذة
- [x] **Phase 5 (final):** اكتشاف 4 ملفات مكررة مع `MODONTY-MASTER-REFERENCE` + `BUSINESS-OVERVIEW` + `02-seo/SEO-STRUCTURED-DATA-METADATA-REFERENCE` → حذف
- [x] `DESIGN_SYSTEM.md` (1277 سطر) نُقل إلى `07-design-ui/` (مكانه الطبيعي)
- [x] `shared.md` → `documents/implementation-plans/SHARED_ENV_MIGRATION_PLAN.md`
- [x] **مجلد `_archive/` اختفى بالكامل** ✨
- **النتيجة:** أرشيف من 150 ملف → **0 (الفولدر محذوف)** — كل المحتوى القيّم في مكانه الصحيح أو مكرر معروف

### CLEAN-06 ✅ DONE — Root configs منظّفة
- [x] `clients-table.yml` → `documents/_archive/`
- [x] `ga4.txt` → `documents/03-analytics-gtm/ga4.txt`
- [x] `mockup/` → `documents/07-design-ui/mockups/`
- [x] `compass-connections.json` → نُقل خارج الـ repo (`%USERPROFILE%\modonty-personal\`)
- [x] `nextjs.yml` → قرار المستخدم: **يبقى** (Cursor IDE rules قديم، مرجوع له في `.cursor/rules/article-creation-perfection-rules.md`)

> **التقرير المختصر:** [REPO-CLEANUP-AUDIT.md](../audits/REPO-CLEANUP-AUDIT.md) — متبقّي 3 بنود فقط (ga4.txt fix · Atlas rotation · nextjs.yml check)

---

## 🛠️ Search Console — UI Enhancements

### SC-UI-01 ✅ DONE (2026-04-26) — Sitemap "URLs" count clickable → drill-down dialog
- [x] **Where:** `/search-console` → Sitemaps card → "URLs" column
- [x] **What:** Number is now a clickable button. On click → dialog opens listing ALL URLs in that sitemap.
- [x] **Built:**
  - `admin/lib/gsc/parse-sitemap.ts` — fetch + regex parse `<url><loc><lastmod>` blocks (server-only, no extra dep)
  - `admin/app/(dashboard)/search-console/actions/sitemap-urls-action.ts` — auth-checked server action
  - `admin/app/(dashboard)/search-console/components/sitemap-urls-dialog.tsx` — searchable dialog with type filter chips (Articles/Categories/Tags/Authors/Clients/Industries/Static/Home/Other), per-row last-modified, opens in new tab on click
- [x] Wired into `sitemap-manager.tsx` — count is now a blue clickable button with hover state

### SC-UI-04 ✅ DONE (2026-04-26) — Indexing API removal: bug fix + dedup via getMetadata (no DB)
- [x] **Bug fixed:** `notifyDeleted` was sending `type: "URL_REMOVED"` but Google's Indexing API v3 enum is `URL_UPDATED | URL_DELETED`. Calls were being silently rejected (UI clicks never reached Google). Confirmed via `urlNotifications.getMetadata` — target URL still showed 404 after click.
- [x] **Source for the fix:** Google Indexing API v3 Discovery Document (`https://indexing.googleapis.com/$discovery/rest?version=v3`) + official "Using the API" page.
- [x] **Dedup design — no DB needed:** Google's `urlNotifications.getMetadata` is the source of truth for "already sent". Uses separate read quota.
  - `lib/gsc/indexing.ts` → new `getRemovalMetadata(url)` + `getRemovalMetadataBulk(urls)` helpers
  - `notifyDeleted(url)` does pre-check via getMetadata; if `latestRemove` exists → returns `{ ok: true, alreadySent: true }` without consuming write quota
  - `page.tsx` fetches metadata for all 11 URLs in parallel (Promise.allSettled)
  - `RemovalRow` shows green "Sent · DD MMM YYYY" badge instead of the button when already sent (full transparency — row stays visible, opacity 60%)
  - Card header shows split count: "X pending" + "Y already sent" (emerald badge)
  - Toast on click distinguishes: "Sent to Google" vs "Already sent earlier" (no quota used)
- [x] **No DB schema change.** Zero drift risk. Google IS the audit log.

### SC-UI-03 ✅ DONE (2026-04-26) — Bulk "Remove X URLs from Google" button removed from Removal Queue
- [x] **Why:** User decision — removals are sensitive (irreversible, consumes Indexing API quota). Per-URL only ensures conscious confirmation per URL.
- [x] **What removed:** `<SeoBulkActions />` usage from `admin/app/(dashboard)/search-console/page.tsx`. Bulk button no longer renders above the Removal Queue table.
- [x] **Kept intact (per user request "الباقي خليه زي ما هو"):** `seo-bulk-actions.tsx` component file, `notifyGoogleDeletedBulkAction` server action, `notifyDeletedBatch` lib function — all preserved as orphan/utility code in case bulk path is needed later from elsewhere.
- [x] **Per-URL flow remains:** "Notify deleted" button on each row in the Removal Queue table (via `SeoRowAction`) — one URL at a time.

### SC-UI-02 ✅ DONE + REVISED (2026-04-26) — Coverage & Tech Health filter pills inside table card
- [x] **First attempt (reverted):** clicked stats scroll to table. User feedback: "bad UX — يضيّعني في الصفحة"
- [x] **Final design:** stats reverted to plain display (no clicks). Filter pills now live INSIDE the coverage table card header, right where the table is — no scroll, no disorientation.
- [x] **Filter pills row:** All · Live · Archived · Missing | Canonical · Robots · Mobile · Soft 404. Each pill shows live count and is color-coded by tone (emerald/amber/red). Disabled state when count = 0.
- [x] **Active state:** filled solid color background with white text. Click again to clear.
- [x] **URL state:** `?filter=KEY` (no anchor) — `scroll={false}` on Link prevents page jump.
- [x] **Built:** `FilterPill` component with tone variants; `filterHref()` helper.
- [x] **File:** `admin/app/(dashboard)/search-console/page.tsx`

---

## 🔍 Google Search Console Integration
> الخطة الكاملة في: `Claude-cowroker/gsc-admin-roadmap.md`
> الـ Library جاهزة في: `admin/lib/gsc/` ✅
> الاتصال: `gsc-modonty@modonty.iam.gserviceaccount.com` — Verified Owner ✅
> **آخر تحديث:** 2026-04-24 — اكتشاف Indexing API v3 + PageSpeed API + CrUX API

---

### 📋 كل ما نقدر نعمله من الـ Admin مع GSC

#### ✅ متاح الآن (Service Account جاهز)

**Analytics & Performance**
- عرض إجمالي Clicks / Impressions / CTR / متوسط الترتيب لأي فترة
- رسم بياني يومي للأداء (7 / 28 / 90 يوم)
- أفضل الكلمات المفتاحية (queries) مرتبة بالـ clicks
- أفضل الصفحات أداءً
- تقسيم الأداء حسب الدولة (السعودية / مصر / الإمارات / غيرها)
- تقسيم الأداء حسب الجهاز (موبايل / ديسك توب / تابلت)
- مقارنة فترة بفترة (هذا الشهر vs الشهر اللي فات)
- فلترة بيانات صفحة معينة أو كلمة معينة

**URL Inspection**
- فحص أي صفحة: مفهرسة / غير مفهرسة / السبب
- آخر مرة زار فيها Googlebot الصفحة
- هل robots.txt يسمح بالفهرسة؟
- هل الـ canonical صح؟ (ما نحدده vs ما Google يراه)
- حالة Mobile Usability لكل صفحة
- هل الصفحة موجودة في الـ Sitemap؟
- سبب عدم الفهرسة بالتفصيل (Soft 404 / Duplicate / Blocked / إلخ)

**Sitemaps**
- عرض كل الـ sitemaps المسجلة مع إحصائياتها
- عدد URLs مرفوعة vs مفهرسة لكل sitemap
- رفع sitemap جديد بضغطة زر من الأدمن
- حذف sitemap قديم أو خاطئ
- Auto-submit تلقائياً عند كل Vercel deploy

**Automation & Alerts**
- تنبيه Telegram لو الـ clicks انخفضت >20% (cron يومي)
- تقرير أسبوعي تلقائي (clicks / impressions / top query)
- Auto-submit sitemap عند نشر محتوى جديد

---

#### ✅ متاح الآن أيضاً — اكتشافات جديدة (2026-04-24)

**Indexing API v3 — بدون OAuth**
- طلب فهرسة أي صفحة فوراً من الـ service account مباشرة (verified owner = يكفي)
- زر "Request Indexing" على كل مقال عند النشر
- Auto-request indexing تلقائي عند نشر مقال جديد
- Batch indexing لصفحات متعددة دفعة واحدة
- `URL_DELETED` notification عند حذف مقال

**PageSpeed Insights API — مجاني بدون auth**
- Performance score (0-100) لأي URL — موبايل + ديسك توب
- Core Web Vitals: LCP / CLS / FID لكل صفحة
- badge الأداء على كل مقال في الأدمن

**Chrome UX Report API (CrUX)**
- بيانات حقيقية من مستخدمي Chrome الفعليين على موقعنا
- LCP / CLS / INP من real users (مش simulation)
- مقارنة أداء الموقع بالوقت الحقيقي

#### ⏳ يحتاج OAuth فقط لـ:

**Removals**
- طلب حذف URL من نتائج Google مؤقتاً (6 أشهر)
- طلب حذف cached version لصفحة
- عرض قائمة الـ removals النشطة

---

#### ❌ غير متاح من الـ API (قيود Google)

- تعديل محتوى الصفحة مباشرة من GSC
- رؤية بيانات المنافسين
- بيانات الـ Ads (هذه Google Ads API منفصلة)

---

### 💡 لماذا هذا مهم؟

الآن كل شغل GSC يتم **يدوياً** من الـ SEO Specialist:
- يفتح GSC كل يوم → يشوف الأداء يدوياً
- كل مقال ينشره → يروح GSC → يطلب فهرسة بيده
- كل مشكلة indexing → يفتح GSC → يفحص URL بيد
- Sitemap → يرفعه يدوياً مع كل تحديث
- التقارير → يسحبها يدوياً ويرسلها

**بعد البناء في الأدمن:**
- الأداء يظهر جنب المحتوى مباشرة — صفر تنقل
- ينشر مقال → الفهرسة تطلب تلقائياً
- كل مقال عنده badge: مفهرس / غير مفهرس + السبب
- Sitemap يترفع تلقائياً مع كل deploy
- تقرير أسبوعي يجي على Telegram تلقائياً

**النتيجة:** توفير ~70-80% من الوقت اليدوي + صفر أخطاء بشرية (نسيان فهرسة، نسيان sitemap).

> ⚠️ الكود **لم يبدأ بعد** — هذا ملف تخطيط. يبدأ التنفيذ بعد اعتماد الخطة.

---

### المرحلة 1 — Dashboard (الأولوية القصوى)
- [ ] إنشاء صفحة `/seo` في الأدمن (route + layout)
- [ ] Performance tab: إجمالي clicks/impressions/CTR/position + رسم بياني يومي
- [ ] Top Queries tab: أفضل 50 كلمة مفتاحية مع clicks/impressions
- [ ] Top Pages tab: أفضل 50 صفحة أداءً
- [ ] Sitemaps tab: قائمة الـ sitemaps + زر Submit + Delete
- [ ] رفع `https://www.modonty.com/sitemap.xml` (فاضية حالياً!)

### المرحلة 2 — URL Inspection في المقالات
- [ ] زر "Inspect" على كل مقال في صفحة Articles في الأدمن
- [ ] عرض: مفهرسة / غير مفهرسة / السبب / آخر crawl / mobile status
- [ ] Cache نتيجة الـ inspection في DB (حد 2,000/يوم)

### المرحلة 3 — Indexing API (بدون OAuth — service account يكفي ✅)
- [ ] بناء `lib/gsc/indexing.ts` — `URL_UPDATED` + `URL_DELETED`
- [ ] ربط الـ indexing بـ Server Action النشر في المقالات
- [ ] زر "Request Indexing" يدوي على كل مقال

### المرحلة 3b — PageSpeed + CrUX (مجاني، بدون auth)
- [ ] بناء `lib/gsc/pagespeed.ts` — Performance score + CWV
- [ ] badge أداء على كل مقال في الأدمن
- [ ] CrUX data للموقع كله

### المرحلة 4 — OAuth (للـ Removals فقط)
- [ ] إنشاء OAuth2 Client ID في Google Cloud Console
- [ ] تشغيل setup script للحصول على refresh token
- [ ] حفظ credentials في Vercel

### المرحلة 4 — Automation
- [ ] Auto-submit sitemap عند كل Vercel deploy (webhook)
- [ ] Auto-request indexing عند نشر مقال جديد
- [ ] تنبيه Telegram لو الـ clicks انخفضت >20% (cron job يومي)
- [ ] تقرير أسبوعي تلقائي (clicks / impressions / top query)
