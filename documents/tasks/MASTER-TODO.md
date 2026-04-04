# مدونتي — قائمة المهام الموحّدة
> مُجمَّعة من مراجعة 125 ملف | آخر تحديث: أبريل 2026

---

## الأولويات الحرجة (ابدأ هنا)

| # | المهمة | الملف المصدر |
|---|--------|-------------|
| 🔴 | إصلاح أخطاء TypeScript وبناء المشروع | BUILD-ERRORS-SUMMARY.md |
| 🔴 | إضافة SCHEDULED لـ Prisma enum أو حذفه من الـ form types | BUILD-ERRORS-SUMMARY.md |
| 🔴 | إضافة حقلي `ogImageWidth/ogImageHeight` للـ Prisma schema أو حذفهم | BUILD-ERRORS-SUMMARY.md |
| 🔴 | تشغيل `npm run build` والتحقق من نجاح البناء | BUILD-ERRORS-SUMMARY.md |
| 🔴 | إضافة متغيرات البيئة الناقصة (NEXTAUTH_URL، DATABASE_URL، RESEND_API_KEY) | ENV-DEPLOY-CHECKLIST.md |

---

## 🤖 الشات بوت

**المصدر:** `06-ai-chatbot/CHATBOT-TODO.md` و `CHATBOT-PRE-DEPLOY-TEST.md`

### Analytics Dashboard
- [ ] بناء لوحة تحليلات لبيانات ChatbotMessage
  - [ ] أكثر الاستفسارات تكراراً
  - [ ] فلترة حسب: التاريخ، المقال، الفئة
  - [ ] مخطط زمني (يومي/أسبوعي)
  - [ ] تصدير CSV

### المحادثات
- [ ] استئناف المحادثات الكاملة من قاعدة البيانات
- [ ] ربط الرسائل بـ session/conversation واحدة

### اختبار ما قبل النشر
- [ ] تشغيل Phase 1.1 RAG test — التحقق 4/4 passed
- [ ] تشغيل Phase 1.2 HTTP test — التحقق من جميع الحالات
- [ ] Phase 2.1–2.5 — اختبار 4 flows يدوياً
- [ ] التحقق: لا cards لـ in-scope + no-DB queries
- [ ] التحقق: روابط Serper تظهر عند استخدام Serper
- [ ] Phase 3 article chat — اختبار التشغيل
- [ ] التحقق: لا console errors أثناء الاختبارات
- [ ] ضبط `COHERE_API_KEY` في env
- [ ] ضبط `SERPER_API_KEY` في env

---

## ⚡ الأداء وCore Web Vitals

**المصدر:** `05-performance/`

### Phase 0 — قياس الخط الأساسي
- [ ] تشغيل Lighthouse (Mobile) على `/` وتسجيل: FCP, LCP, TBT, CLS
- [ ] حفظ التقرير (JSON أو screenshot) للمقارنة
- [ ] تسجيل Performance trace (DevTools → CPU 4× slowdown, Network Slow 4G)

### Phase 1 — تخفيف Layout والـ Navigation
- [ ] إعادة تشغيل Lighthouse بعد Phase 1 والتحقق من تحسن long tasks

### Phase 2 — تأجيل الشات بوت
- [ ] إعادة تشغيل Lighthouse بعد Phase 2
- [ ] التحقق: chatbot JS لا يظهر في long tasks الرئيسية

### Phase 3 — Home Feed وقوائم المقالات
- [ ] تقسيم interactive pieces إلى client islands:
  - [ ] Like button
  - [ ] Favorite/Bookmark toggle
  - [ ] Share / TTS controls
- [ ] عرض أول N posts فقط above fold
- [ ] استخدام InfiniteArticleList للـ scroll loading
- [ ] إعادة تشغيل Lighthouse بعد Phase 3

### Phase 4 — التواريخ
- [ ] تنسيق التواريخ على الـ server بدلاً من الـ client
- [ ] إبقاء RelativeTime (client) فقط حيث يحتاج تحديثاً حياً
- [ ] حذف `Date.now()` من مسارات الـ render

### TBT المؤقت (لإرجاعه لاحقاً)
- [ ] مراجعة التغييرات المؤقتة في `TBT_Temporary_Changes.md` وإرجاع ما تم تعطيله

---

## 🛠️ التطوير التقني

**المصدر:** `04-technical-dev/`

### إصلاحات TypeScript
- [ ] حل مشكلة SEODoctor module imports (قد يحتاج Prisma client regeneration)
- [ ] إصلاح structured data type issues في `lib/seo/structured-data.ts`
- [ ] إصلاح User form type issues في `users/new/page.tsx`
- [ ] إصلاح Articles page client type issues

### Cache Components (عند تفعيل `cacheComponents: true`)
- [ ] إزالة route segment configs (dynamic, revalidate, fetchCache)
- [ ] استبدال revalidate بـ cacheLife للـ cached functions
- [ ] إضافة Suspense boundary فوق Footer (بسبب `new Date()` في FooterYear)
- [ ] لـ API routes: استخراج cached logic لـ helper مع "use cache"
- [ ] استخدام `await connection()` للـ request-time الصريح

### وظيفة البحث (Search)
- [ ] إضافة `search?: string` لـ ArticleFilters في `modonty/app/api/helpers/types.ts`
- [ ] إضافة search filter لـ `getArticlesCached`
- [ ] تنفيذ Prisma `contains` search (title + excerpt)
- [ ] إنشاء `/app/search/page.tsx` (Server Component)
- [ ] إنشاء `/app/search/loading.tsx` مع skeleton
- [ ] إنشاء `/app/search/error.tsx`
- [ ] إنشاء `SearchInput.tsx` (Client Component)
- [ ] إنشاء `SearchResults.tsx` (Server Component)
- [ ] إنشاء `SearchEmptyState.tsx`
- [ ] تحديث TopNav form action لـ `/search`
- [ ] إضافة تحقق: لا يبحث بأقل من 2 حرف
- [ ] إضافة Arabic pluralization لعدد النتائج
- [ ] اختبار: keyboard navigation (Enter, Tab, Escape)

### Gemini Adapter (بديل OpenAI — توفير 35%)
- [ ] تثبيت `@google/generative-ai`
- [ ] الحصول على Gemini API key من Google AI Studio
- [ ] إضافة `GEMINI_API_KEY` لـ `.env.local`
- [ ] إنشاء `admin/lib/gemini-seed.ts`
- [ ] إنشاء abstraction layer في `admin/lib/ai-provider.ts`
- [ ] تحديث seed functions لاستخدام الـ abstraction
- [ ] إضافة fallback: Gemini → OpenAI عند الفشل
- [ ] اختبار: توليد 10 مقالات عربية وقياس التكلفة

---

## 🔍 SEO وStructured Data

**المصدر:** `02-seo/`

### Phase A — Social Image Alt
- [ ] إضافة `onAltChange` callback لـ DeferredImageUpload
- [ ] ربط `onAltChange` في SEOSection
- [ ] تحديث generator لاستخدام `socialImageAlt` في og:image:alt و twitter:image:alt

### Phase B — Generator Meta 100%
- [ ] إضافة `socialImageAlt` لـ generator select
- [ ] إضافة `alternateLanguages` لـ generator select
- [ ] إخراج: `googlebot` (مشتق من robots)
- [ ] إخراج: `hreflang` من alternateLanguages
- [ ] إخراج: `openGraph.images[].alt`
- [ ] إخراج: `twitter.imageAlt`

### Phase C — JSON-LD Full @graph
- [ ] إضافة env variables:
  - [ ] `SITE_URL`, `SITE_NAME`, `BRAND_DESCRIPTION`
  - [ ] `SAME_AS` (JSON array), `CONTACT_EMAIL`, `CONTACT_TYPE`
  - [ ] `LOGO_URL`, `KNOWS_LANGUAGE`, `ADDRESS`, `GEO`
- [ ] تطوير `generate-modonty-page-jsonld.ts` لبناء @graph كامل
- [ ] تضمين: Organization, WebSite, WebPage/AboutPage, BreadcrumbList

### Phase D — Validator
- [ ] السماح بـ: Organization, WebSite, AboutPage, BreadcrumbList
- [ ] التحقق من وجود WebPage أو AboutPage
- [ ] التحقق من معايير Adobe Structured Data

### Phase E — UI/DB إضافية
- [ ] إضافة Prisma fields: `author`, `keywords`, `googlebot`, `ogDeterminer`, `ogLocaleAlternate`, `twitterSiteId`, `twitterCreatorId`
- [ ] إضافة UI inputs في تبويب SEO: author, keywords, googlebot
- [ ] إضافة UI inputs في تبويب Social: ogDeterminer, twitterSiteId/CreatorId
- [ ] إضافة hint عند فراغ الـ description في Generated SEO
- [ ] تجميع Meta Tags بأقسام في الـ UI

### JSON-LD Knowledge Graph
- [ ] مراجعة خطة Knowledge Graph في `02-seo/jsonld-specs/JSON-LD-KNOWLEDGE-GRAPH-RECHECK-PLAN.md`
- [ ] تطبيق التوصيات على بيانات Author (Singleton)
- [ ] مراجعة Cloudinary SEO filenames وتطبيق الحل

---

## 📊 Analytics وGTM

**المصدر:** `03-analytics-gtm/`

- [ ] إضافة `NEXT_PUBLIC_GTM_CONTAINER_ID` لـ env إذا لم يكن موجوداً
- [ ] التحقق من صحة GTM integration في production
- [ ] اختبار GA4 events على جميع الصفحات
- [ ] تكوين conversion tracking
- [ ] اختبار event firing
- [ ] التحقق من جمع البيانات في GA4

---

## 🚀 النشر والبنية التحتية

**المصدر:** `08-intake-setup/setup-deploy/`

### متغيرات البيئة
- [ ] `NEXTAUTH_URL=https://admin.modonty.com` في production
- [ ] التحقق من `DATABASE_URL` → MongoDB production
- [ ] التحقق من قوة `AUTH_SECRET`
- [ ] التحقق من `CLOUDINARY_URL` والمفاتيح المرتبطة
- [ ] التحقق من `RESEND_API_KEY` و `RESEND_FROM`
- [ ] حذف trailing space من `GOOGLE_SEARCH_CONSOLE_SITE_URL`
- [ ] التحقق من `OPENAI_API_KEY` (غير مقتطع)
- [ ] حذف المتغيرات غير المستخدمة: `RESEND_EMAIL_LOGO_URL`, `NEXT_PUBLIC_PHONE_NUMBER`, `NEXT_PUBLIC_WHATSAPP_NUMBER`

### Google OAuth
- [ ] فتح Google Cloud Console وإنشاء/اختيار مشروع
- [ ] تفعيل Google+ API أو People API
- [ ] إنشاء OAuth Consent Screen
- [ ] إنشاء OAuth 2.0 Client ID
- [ ] إضافة Authorized Origins:
  - [ ] `http://localhost:3000`
  - [ ] `https://modonty.com`
- [ ] إضافة Redirect URIs:
  - [ ] `http://localhost:3000/api/auth/callback/google`
  - [ ] `https://modonty.com/api/auth/callback/google`
- [ ] تحديث `.env` بـ Client ID و Client Secret
- [ ] اختبار تسجيل الدخول بـ Google

---

## 🎨 المنتج والميزات الجديدة

**المصدر:** `01-business-marketing/COMPETITIVE_ANALYSIS.md` و `MODONTY_100_EXTRA_SUGGESTIONS.md`

### الأسبوع الأول (Phase 1)
- [ ] اختبار Image Fallback System مع URLs صحيحة/مكسورة/فارغة
- [ ] اختبار Reading Time على مقالات قصيرة (<3 دقائق) وطويلة (>10 دقائق)
- [ ] اختبار Bookmark: إضافة/إزالة، بدون مصادقة، استمرارية DB
- [ ] إنشاء صفحة "المحفوظات" (My Bookmarks)
- [ ] اختبار Related Articles: نفس الفئة، لا يظهر المقال الحالي

### الأسبوع الثاني (Phase 2)
- [ ] إضافة قسم Trending (الأيام 6-7)
- [ ] إضافة Author Follow Functionality (الأيام 7-8)
- [ ] تحسين البحث بـ Autocomplete (الأيام 8-9)

### ميزات مفقودة للإضافة
- [ ] Email Newsletters — جدول Subscribers في DB + إرسال تلقائي عند النشر
- [ ] Content Scheduling — حقل `scheduledAt` في Articles
- [ ] RSS Feeds
- [ ] Content Versioning
- [ ] API Access للعملاء
- [ ] Export/Import للمحتوى
- [ ] Tags System (بالإضافة للفئات)
- [ ] Custom Branding لكل عميل
- [ ] Content Templates
- [ ] Multi-language Support للمقالات
- [ ] Advanced SEO Tools
- [ ] Content Archiving

### تحسينات الأسعار (Pricing Cards)
**الباقة المجانية:**
- [ ] إضافة شعار العميل في الصفحة الرئيسية
- [ ] إضافة "زيارة الموقع" لمن لديه موقع

**الباقة الأساسية:**
- [ ] Content Calendar (تواريخ النشر القادمة)
- [ ] Article preview + approval workflow
- [ ] Canonical URL لكل مقالة
- [ ] تنبيه عند نشر مقال جديد
- [ ] مقارنة الأداء شهرياً

**الباقة الاحترافية:**
- [ ] تقارير أداء شهرية
- [ ] تصدير قائمة المشتركين (CSV/GDPR)
- [ ] قوالب ردود الدعم
- [ ] Bulk comment moderation
- [ ] تصدير Analytics شهرياً (CSV/Excel)

**الباقة المطورة:**
- [ ] تقرير SEO دوري (ربع سنوي)
- [ ] تنبيهات تغيير ترتيب المنافسين
- [ ] تقارير Analytics مخصصة
- [ ] دعم متعدد اللغات للمقالات
- [ ] إدارة متقدمة للأدوار (admin, editor, viewer)
- [ ] تكامل CRM

**عام:**
- [ ] فترة تجريبية مجانية (1-2 أسبوع)
- [ ] خصم الدفع السنوي (%)
- [ ] جدول مقارنة سريع بين الباقات
- [ ] FAQ للاشتراكات والترقيات

---

## 🧪 الاختبار وضمان الجودة

**المصدر:** `05-performance/QA-TEST-REPORT-COMPLETE.md`

- [ ] اختبار Cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] اختبار Mobile (أحجام مختلفة)
- [ ] Accessibility audit
- [ ] Performance audit (Lighthouse)
- [ ] التحقق: جميع ألوان Design System تستخدم theme tokens (لا hex hardcoded)
- [ ] التحقق: لا linting errors
- [ ] التحقق: لا console.log في production
- [ ] التحقق: لا TODO comments في الكود

---

## 📈 ملخص الأولويات

| المجال | الحالة | الأهمية |
|--------|--------|---------|
| إصلاح TypeScript build errors | 🔴 مطلوب فوراً | حرجة |
| متغيرات البيئة للـ production | 🔴 مطلوب فوراً | حرجة |
| Phase 0 قياس الأداء (Baseline) | 🟠 هذا الأسبوع | عالية |
| وظيفة البحث | 🟠 هذا الأسبوع | عالية |
| SEO Phase A+B | 🟠 هذا الأسبوع | عالية |
| Chatbot Analytics Dashboard | 🟡 قريباً | متوسطة |
| Gemini Adapter | 🟡 قريباً | متوسطة |
| ميزات الأسبوع الثاني | 🟢 لاحقاً | عادية |
| تحسينات الأسعار | 🟢 لاحقاً | عادية |

---

> **ملاحظة:** هذا الملف مُجمَّع تلقائياً من مراجعة كل الوثائق — أي مهمة تنجز شيلها أو ضع ✅ أمامها
