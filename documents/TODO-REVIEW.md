# TODO — مراجعة قبل الإطلاق

---

## ✅ كل الأقسام التقنية مكتملة

> الباقي فقط: فحص يدوي في المتصفح + عنصرين مؤجلين

---

## مراجعة SEO Cache + Revalidation — كل حدث (CRUD)

### التأكد إن كل عملية (إضافة / تعديل / حذف) تحدّث الكاش + JSON-LD + Meta Tags

#### المقالات (Articles)
- [ ] إنشاء مقال جديد → يتحدث: Article JSON-LD + listing cache + sitemap + revalidateModontyTag("articles")
- [ ] تعديل مقال → يتحدث: Article JSON-LD + Meta Tags + revalidateModontyTag("articles")
- [ ] نشر مقال (publish) → يتحدث: status + JSON-LD + listing cache + revalidateModontyTag("articles")
- [ ] حذف مقال → يتحدث: listing cache + sitemap + revalidateModontyTag("articles")

#### العملاء (Clients)
- [ ] إنشاء عميل جديد → يتحدث: Client JSON-LD + Organization schema + listing cache + revalidateModontyTag("clients")
- [ ] تعديل عميل → يتحدث: Client JSON-LD + Meta Tags + Organization schema + revalidateModontyTag("clients")
- [ ] حذف عميل → يتحدث: listing cache + revalidateModontyTag("clients")

#### التصنيفات (Categories)
- [ ] إنشاء تصنيف → يتحدث: Category JSON-LD + listing cache + revalidateModontyTag("categories")
- [ ] تعديل تصنيف → يتحدث: Category JSON-LD + listing cache + revalidateModontyTag("categories")
- [ ] حذف تصنيف → يتحدث: listing cache + revalidateModontyTag("categories")

#### التاجات (Tags)
- [ ] إنشاء تاج → يتحدث: Tag JSON-LD + listing cache + revalidateModontyTag("tags")
- [ ] تعديل تاج → يتحدث: Tag JSON-LD + listing cache + revalidateModontyTag("tags")
- [ ] حذف تاج → يتحدث: listing cache + revalidateModontyTag("tags")

#### القطاعات (Industries)
- [ ] إ��شاء قطاع → يتحدث: Industry JSON-LD + listing cache + revalidateModontyTag("industries")
- [ ] تعديل قطاع → يتحدث: Industry JSON-LD + listing cache + revalidateModontyTag("industries")
- [ ] حذف قطاع → يتحدث: listing cache + revalidateModontyTag("industries")

#### الأسئلة الشائعة (FAQs)
- [ ] إنشاء سؤال → يتحدث: revalidateModontyTag("faqs")
- [ ] تعديل سؤال → يتحدث: revalidateModontyTag("faqs")
- [ ] حذف سؤال → يتحدث: revalidateModontyTag("faqs")

#### الإعدادات (Settings)
- [ ] حفظ إعدادات الموقع → يتحدث: Home page cache + Organization JSON-LD + revalidateModontyTag("settings")
- [ ] Generate All في SEO Cache → يتحدث: كل listing pages (7 صفحات) + JSON-LD + Meta Tags

## فحص يد��ي في المتصفح

- [ ] تشغيل `seed-images.ts` أول ثم `Seed Dev Data` button من `/settings`
- [ ] مراجعة الصور على Cloudinary في فولدر `seed-data/`
- [ ] Console App — فحص يدوي: campaigns, leads, comments, subscribers, SEO
- [ ] Modonty Public — فحص يدوي: clients, categories, articles, FAQ, تعليقات, لا��كات
- [ ] Bing Webmaster Tools — ربط modonty.com + تف��يل IndexNow (يحتاج حساب Microsoft)

## مؤجل لما بعد الإطلاق

- [ ] `manifest.json` — PWA manifest (اختياري، مش مطلوب للإطلاق)
- [ ] HowTo schema — feature كامل: حقل جديد في Article + UI خطوات في الأدمن + JSON-LD generator

---
---

## ✅ مكتمل

### Bugs Fixed by Integration Test (2026-04-04)

- [x] createCategory — كان يقبل اسم فاضي → أضفنا validation
- [x] createTag — كان يقبل اسم فاضي → أضفنا validation
- [x] createIndustry — كان يقبل اسم فاضي → أضفنا validation
- [x] createClient — كان يقبل اسم فاضي → أضفنا validation
- [x] createFAQ — كان يقبل سؤال فاضي → أضفنا validation
- [x] createArticle — status = WRITING دائماً (by design — المقال يمر بمراحل)

### Settings V2

- [x] استبدال `/settings` بـ `/settings-v2` نهائياً — تم الدمج، الآن `/settings` يعرض النسخة الجديدة
- [x] التأكد من حفظ كل تاب — Modonty يحفظ 6 actions، SEO Cache يحفظ العناوين، System read-only
- [x] ربط أزرار Generate في SEO Cache بالجينيريتورز الفعلية — 7 أزرار + Generate All شغالين

### SEO Generators

- [x] Phase 1: category SEO generator — يقرأ getAllSettings() مع fallback لـ env var
- [x] Phase 2: tag SEO generator — tag-seo-generator.ts موجود ويقرأ getAllSettings()
- [x] Phase 3: industry SEO generator — industry-seo-generator.ts موجود ويقرأ getAllSettings()
- [x] Phase 6: زر Regenerate All في Settings — "Generate All" يستدعي regenerateAllListingCaches()

### Cross-App Revalidation

- [x] بناء API route في modonty app — /api/revalidate/tag + /api/revalidate/article
- [x] الأدمن يرسل revalidateModontyTag — Articles (8 ملفات) + Settings (7 استدعاءات)
- [x] إضافة revalidateModontyTag لـ categories, tags, industries, clients, FAQs — 15 ملف، 31 استدعاء جديد
- [x] توحيد اسم السيكرت — كل الملفات تستخدم REVALIDATE_SECRET الآن (4 ملفات اتعدلت)

### robots.ts — سياسة AI ذكية

- [x] اسمح لبوتات البحث: OAI-SearchBot (ChatGPT Search) + PerplexityBot (Perplexity)
- [x] احظر بوتات التدريب: GPTBot + Google-Extended + CCBot + ClaudeBot + anthropic-ai + Bytespider
- [x] Googlebot مسموح (يشغل AI Overviews + البحث العادي)

### Client SEO Generator

- [x] generate-client-seo.ts موجود ويشتغل — يقرأ getAllSettings() + يتنادى من create-client + update-client + SEO tab + Regenerate All

### أمان ملفات .env

- [x] `.gitignore` يحظر `.env` و `.env*.local` — ولا ملف env مرفوع في git

### AI SEO (AEO)

- [x] `<meta name="robots" content="max-snippet:-1">` — موجود في googleBot config
- [x] SpeakableSpecification في FAQ JSON-LD — موجود مع CSS selectors للأسئلة والأجوبة
- [x] FAQ Schema — FAQPage + Question/Answer + upvoteCount + SpeakableSpecification شغال 100%
- [x] `llms.txt` — يتبع مواصفات llmstxt.org الرسمية (H1 + blockquote + H2 sections)
- [x] `llms-full.txt` — وثائق تفصيلية لكل أنواع المحتوى والـ schemas
- [x] `.well-known/ai-plugin.json` — manifest لـ ChatGPT plugin
- [x] `AI-SEO-STRATEGY.md` — وثيقة مرجعية كاملة: سياسة البوتات + structured data + خطة التطوير
- [x] `about`/`mentions` في Article — حُذف نهائياً: Google لا يدعمهم (غير موجودين في docs) والكود لا يستخدمهم
- [x] hreflang — موجود فعلاً (ar + x-default) في generateMetadataFromSEO + جاهز لإضافة لغات عبر Settings

### GEO SEO

- [x] LocalBusiness type — مدعوم عبر organizationType
- [x] areaServed — موجود في Organization + ContactPoint مع ISO 3166-1
- [x] GeoCoordinates — موجود (latitude/longitude) مع validation
- [x] addressCountry ISO 3166-1 — getCountryCode() يحول لـ alpha-2
- [x] sameAs — موجود مع URL validation + HTTPS enforcement
- [x] GBP fields في Prisma — gbpProfileUrl, gbpPlaceId, gbpAccountId, gbpLocationId, gbpCategory
- [x] NAP consistency — Name, Address, Phone موجودين في Organization JSON-LD + ContactPoint
- [x] OpeningHoursSpecification — يُرسم من حقل Prisma Json
- [x] hasMap — يُبنى تلقائياً من lat/lng كـ Google Maps URL
- [x] GBP profileUrl — يُضاف تلقائياً لـ sameAs array
- [x] priceRange — يُرسم في Organization JSON-LD

### فحص SEO — كل الصفحات العامة

- [x] `/` الرئيسية — generateMetadata + JSON-LD (WebSite+Organization+WebPage) + Settings cache
- [x] `/about` — generateMetadata + JSON-LD (AboutPage) + BreadcrumbList
- [x] `/contact` — metadata + JSON-LD (ContactPage)
- [x] `/terms` — generateMetadata + JSON-LD
- [x] `/categories` — generateMetadata + JSON-LD + Settings cache
- [x] `/clients` — generateMetadata + JSON-LD + Settings cache
- [x] `/clients/[slug]` — generateMetadata + JSON-LD (Organization) + BreadcrumbList + generateStaticParams
- [x] `/clients/[slug]/about` — generateMetadata مع اسم العميل
- [x] `/clients/[slug]/reviews` — generateMetadata مع اسم العميل
- [x] `/clients/[slug]/photos` — generateMetadata مع اسم العميل
- [x] `/clients/[slug]/contact` — generateMetadata مع اسم العميل
- [x] `/help/faq` — metadata + FAQPage JSON-LD (Question/Answer + SpeakableSpecification)
- [x] `/sitemap.ts` — مقالات + عملاء + تصنيفات من DB + صفحات ثابتة
- [x] `/trending` — generateMetadata + JSON-LD من Settings cache
- [x] `/categories/[slug]` — generateMetadata + JSON-LD (DefinedTerm + CollectionPage)
- [x] `/articles/[slug]` — generateMetadata + JSON-LD (Article + FAQPage + Person) + hreflang
- [x] `/users/[id]` — generateMetadata + JSON-LD (Person schema)
- [x] `/news` — metadata export
- [x] `/help` — metadata export
- [x] `/legal/*` — generateMetadata (4 صفحات)

### noindex — الصفحات المحمية (17 صفحة)

- [x] `/users/login` — noindex عبر layout.tsx
- [x] `/users/register` — noindex عبر layout.tsx
- [x] `/users/profile/*` — noindex عبر profile/layout.tsx (يغطي 7 صفحات فرعية)
- [x] `/users/notifications` — noindex عبر metadata export
- [x] `/search` — noindex عبر robots في generateMetadataFromSEO
- [x] `/subscribe` — noindex عبر robots في generateMetadataFromSEO
- [x] `/help/feedback` — noindex عبر robots في generateMetadataFromSEO
- [x] `/clients/[slug]/followers` — noindex عبر metadata export
- [x] `/clients/[slug]/likes` — noindex عبر metadata export
- [x] `/clients/[slug]/reels` — noindex عبر metadata export
- [x] `/clients/[slug]/mentions` — noindex عبر metadata export

### تنظيف + Build

- [x] SeedDevButton محمي بـ `NODE_ENV === "development"`
- [x] حذف `html-test/` — 3 ملفات (51KB)، ولا reference في الكود
- [x] `pnpm build` admin — zero errors
- [x] `pnpm build` modonty — zero errors
- [x] `pnpm build` console — zero errors
