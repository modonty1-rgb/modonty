# مدونتي — المرجع الشامل الموحد
> مُجمَّع من +100 ملف | آخر تحديث: أبريل 2026 | لا تكرار، لا حشو

---

## 1. ما هي مدونتي؟

مدونتي منصة SaaS عربية لإدارة المحتوى التسويقي. تبني لكل عميل حضوراً رقمياً حقيقياً عبر نظام مقالات احترافية + Authority Blog مشترك ينمو بمرور الوقت.

**جوهر الفكرة:** "حضور لا وعود" — نكتب المقالات، نصممها، ننشرها، ونوصل النتائج مباشرة لـ Analytics العميل.

---

## 2. المنصات الثلاث

| المنصة | الغرض | الـ URL |
|--------|-------|---------|
| **jbrseo.com** | واجهة العميل، الاشتراكات، عرض القيمة | jbrseo.com |
| **modonty.com** | النظام الأساسي، المقالات، Authority Blog | modonty.com |
| **admin (jbrtechno.com)** | لوحة الإدارة، العمليات، إدارة الموظفين | jbrtechno.com |

**البنية التقنية:** Monorepo / pnpm workspace يضم أربع تطبيقات:
- `admin` — لوحة الإدارة (Next.js)
- `modonty` — الموقع العام (Next.js، `lang="ar"`, `dir="rtl"`)
- `console` — لوحة العميل (Next.js)
- `dataLayer` — قاعدة بيانات مشتركة (Prisma + MongoDB)

---

## 3. نموذج الأعمال

### نظام المقالتين
**المقال الرئيسي (Authority Blog):** مقال احترافي SEO على مدونة مدونتي المركزية — يذكر العميل بشكل طبيعي، يحوي روابط خلفية عالية الجودة، وقيمته تزيد كلما قوي الـ blog.

**النسخة المخصصة (Premium فقط):** نفس المقال معدّل لموقع العميل — جاهز للنشر بدون تعديل.

### جدول التراكم
| الفترة | ما يحدث |
|--------|---------|
| شهر 1-3 | بناء الأساس |
| شهر 4-6 | بناء الزخم |
| شهر 7-12 | التسارع |
| شهر 13-18 | النضج — عائد استثمار كامل |

**ملاحظة:** العميل يدفع 12 شهراً ويحصل على 18 شهراً تسليم.

---

## 4. الباقات والأسعار

| الباقة | السعر (ريال/سنة) | مقالات/شهر | الفئة المستهدفة |
|--------|-----------------|-----------|----------------|
| **Basic** | 2,499 | 2 | شركات صغيرة، ناشئة |
| **Standard** | 3,999 | 4 | شركات نامية |
| **Pro** | 6,999 | 8 | شركات راسخة |
| **Premium** | 9,999 | 12 | مؤسسات كبيرة، وكالات |

### ما يشمله الكل (جميع الباقات)
- مقالات عربية احترافية مع تصميم كامل
- صفحة عميل (لوجو، تبويبات: كل شيء، عن، تواصل، صور، مراجعات، متابعين، ريلز)
- SEO كامل (JSON-LD، Meta Tags، Canonical، Open Graph)
- لوحة Analytics (مشاهدات، تفاعل، مصادر الزيارات)
- GTM integration (العميل يرى نتائجه في Analytics الخاص به)
- دعم RTL عربي

### الإضافات حسب الباقة
**Standard فقط:** scroll depth + time-on-page، نظام متابعين، مراجعات
**Pro فقط:** شارة verified، lead scoring، تتبع منافسين، Core Web Vitals، conversion tracking
**Premium فقط:** مدير حساب مخصص، نسخة مخصصة لموقع العميل، CMS integrations، white-label

### ملاحظات البيع
- ترقية الباقة متاحة في أي وقت
- خصم 10-15% للدفع السنوي
- ضمان استرداد إذا لم يكن راضياً بالشهر الأول
- بيانات العميل قابلة للتصدير عند الإلغاء

---

## 5. المزايا التنافسية

1. **Authority Blog الفريد** — ما في منصة عربية بنفس النموذج
2. **18 شهر مقابل 12** — يضمن أن العميل يرى نتائج قبل انتهاء الاشتراك
3. **شفافية كاملة** — GTM integration؛ العميل يرى النتائج في Analytics الخاص به
4. **توفير 90%** — وكالات تقليدية: 36,000-96,000 ريال/سنة؛ مدونتي: 2,499-9,999 ريال/سنة
5. **محتوى عربي يدوي** — مكتوب بأسلوب طبيعي، مو AI
6. **بساطة كاملة للعميل** — نبيع "حضور" مو "أدوات SEO"

---

## 6. فرصة السوق

| المؤشر | القيمة |
|--------|--------|
| الاقتصاد الرقمي السعودي | 495 مليار دولار (15% من GDP) |
| الإعلانات الرقمية (2024→2030) | 8.9 → 23.1 مليار دولار |
| سوق المحتوى الرقمي (2030) | 4.3-5.3 مليار دولار |
| التجارة الإلكترونية (2024) | 140 مليار ريال |
| خدمات SEO | 4-10.1 مليار ريال/سنة |

---

## 7. التقييم الصريح (أبريل 2026)

**نسبة النجاح الحالية: 35%** (3.5x أعلى من معدل الشركات الناشئة)

### نقاط الضعف الحرجة
1. **صفر عملاء** — ما في validation حقيقي من السوق بعد
2. **شخص واحد** — خطر الاحتراق يوقف المشروع
3. **MongoDB Atlas M0** (مجاني) — ضاعت بيانات مرة. غير مقبول للبيع للشركات
4. **المنتج ما خلص** — admin لم يكتمل، الموقع العام لم يختبر
5. **WordPress مجاني** — المنافس الرئيسي؛ لازم يكون عندك جواب قاطع لـ "ليش أدفع؟"

### ما يرفع النسبة من 35% إلى 60%+
| الإجراء | الأثر |
|---------|-------|
| اطلق بـ 80% ما تنتظر 100% | +10% |
| 3 عملاء مجانيين الشهر الحالي للـ feedback | +5% |
| ارقّي الداتابيس لـ MongoDB M10+ | +5% |
| ركز على شريحة واحدة (مثال: عيادات أسنان في الرياض) | +5% |
| شريك يسوّق وأنت تبني | +5% |

**القاعدة الذهبية:** الكمال عدو الإطلاق. كل يوم في تحسين الكود بدون تكليم عميل = النسبة تنزل.

---

## 8. المهام — بالأولويات

### 🔴 حرجة (الآن)

| المهمة | المصدر |
|--------|--------|
| إصلاح أخطاء TypeScript (SCHEDULED enum، ogImageWidth/Height) | BUILD-ERRORS-SUMMARY |
| تشغيل `npm run build` والتحقق من نجاح البناء | BUILD-ERRORS-SUMMARY |
| إضافة `NEXTAUTH_URL`، `DATABASE_URL`، `RESEND_API_KEY` | ENV-DEPLOY-CHECKLIST |
| ترقية MongoDB من M0 إلى M10+ | HONEST-ASSESSMENT |
| إطلاق المنتج (ولو 80%) | HONEST-ASSESSMENT |

### 🟠 هذا الأسبوع

**SEO Cache — إكمال النظام:**
- إصلاح مولد الفئات (يقرأ كل Settings مو بس رابط الموقع)
- بناء مولد للتاقات (ينسخ pattern الفئات + يغير URL)
- بناء مولد للصناعات (نفس الشيء)
- الفئات والعملاء شغالين ✅؛ التاقات والصناعات لا بعد ❌

**وظيفة البحث:**
- إضافة `search?: string` لـ ArticleFilters
- إضافة Prisma `contains` (title + excerpt)
- إنشاء `/app/search/page.tsx` + loading + error
- إنشاء `SearchInput.tsx` (Client) + `SearchResults.tsx` (Server)
- تحديث TopNav لـ `/search`

**SEO Generator (Phase A+B):**
- إضافة `socialImageAlt` لـ generator → og:image:alt + twitter:image:alt
- إضافة `hreflang` من alternateLanguages
- إضافة `googlebot` مشتق من robots

**متغيرات البيئة (Production):**
- التحقق من `CLOUDINARY_URL`، `RESEND_API_KEY`، `OPENAI_API_KEY`
- حذف trailing space من `GOOGLE_SEARCH_CONSOLE_SITE_URL`
- حذف المتغيرات غير المستخدمة

**Google OAuth:**
- إنشاء OAuth Consent Screen في Google Cloud Console
- إضافة Redirect URIs: `localhost:3000` + `modonty.com`
- اختبار تسجيل الدخول بـ Google

### 🟡 قريباً

**الشات بوت:**
- بناء Analytics Dashboard (أكثر الاستفسارات تكراراً، فلترة، مخطط زمني، تصدير CSV)
- ضبط `COHERE_API_KEY` و `SERPER_API_KEY`
- تشغيل test suite: Phase 1.1 RAG، Phase 1.2 HTTP، Phase 2.1-2.5 Manual

**الأداء (Core Web Vitals):**
- قياس Lighthouse Mobile baseline (FCP, LCP, TBT, CLS)
- تقسيم interactive islands: Like، Bookmark، Share/TTS
- تنسيق التواريخ على Server (إزالة Date.now() من render)
- مراجعة التغييرات المؤقتة في TBT_Temporary_Changes.md

**Gemini Adapter (بديل OpenAI — توفير 35% تكاليف AI):**
- تثبيت `@google/generative-ai`
- إنشاء `admin/lib/gemini-seed.ts` + abstraction layer
- إضافة fallback: Gemini → OpenAI عند الفشل

**SEO JSON-LD (Phase C+D):**
- بناء @graph كامل: Organization + WebSite + WebPage + BreadcrumbList
- إضافة env variables: SITE_URL، SITE_NAME، SAME_AS، LOGO_URL، GEO
- تطوير Validator يقبل: Organization، WebSite، AboutPage، BreadcrumbList

### 🟢 لاحقاً

**TypeScript Fixes:**
- SEODoctor module imports (قد يحتاج Prisma client regeneration)
- structured data type issues في `lib/seo/structured-data.ts`
- User form types في `users/new/page.tsx`

**ميزات جديدة:**
- Email Newsletters — Subscribers table + إرسال تلقائي عند النشر
- Content Scheduling — حقل `scheduledAt` في Articles
- RSS Feeds
- Tags System (إضافة للفئات)
- Content Templates
- Multi-language Support
- API Access للعملاء

**تحسينات بطاقات الأسعار:**
- جدول مقارنة بين الباقات
- FAQ للاشتراكات
- فترة تجريبية مجانية
- خصم الدفع السنوي

---

## 9. Routes المهمة (modonty.com)

### صفحات المستخدم
| الرابط | الوصف |
|--------|-------|
| `/` | الرئيسية؛ `?category=<slug>` للفلترة |
| `/search` | بحث: `q`, `page`, `type`, `sort_articles`, `sort_clients` |
| `/trending` | المقالات الرائجة؛ `?period=7/14/30` |
| `/articles/[slug]` | مقال كامل مع JSON-LD |
| `/categories` | قائمة التصنيفات |
| `/categories/[slug]` | مقالات التصنيف |
| `/clients` | دليل العملاء |
| `/clients/[slug]` | صفحة العميل الرئيسية |
| `/clients/[slug]/about` | معلومات + بيانات رسمية |
| `/clients/[slug]/contact` | نموذج التواصل |
| `/clients/[slug]/followers` | قائمة المتابعين |
| `/clients/[slug]/photos` | معرض الصور |
| `/clients/[slug]/reviews` | المراجعات |
| `/users/login` | تسجيل دخول (Email + Google) |
| `/users/register` | إنشاء حساب |
| `/users/profile` | الملف الشخصي |
| `/users/notifications` | الإشعارات |

### API Routes الرئيسية
| المسار | الغرض |
|--------|-------|
| `/api/articles` | GET مع pagination: page, limit, category, client, featured |
| `/api/articles/[slug]/like` | POST/DELETE |
| `/api/articles/[slug]/favorite` | POST/DELETE |
| `/api/articles/[slug]/comments` | GET/POST |
| `/api/articles/[slug]/chat` | POST (chatbot) |
| `/api/clients/[slug]/follow` | GET/POST/DELETE |
| `/api/categories/[slug]/analytics` | GET |

---

## 10. GTM — التطبيق التقني

### تدفق البيانات
`زيارة صفحة → استخراج بيانات العميل من URL → dataLayer push → GTM → GA4`

### الـ Events الأساسية

```javascript
// Client Context (عند كل صفحة عميل/مقال)
window.dataLayer.push({
  event: 'client_context',
  client_id: '...',
  client_slug: '...',
  client_name: '...'
});

// Page View
window.dataLayer.push({
  event: 'page_view',
  page_title: '...',
  page_location: window.location.href,
  client_id: '...',
  article_id: '...'
});
```

### الأولوية في جلب إعدادات GTM
1. `Settings.gtmContainerId` (قاعدة بيانات)
2. `NEXT_PUBLIC_GTM_CONTAINER_ID` (env variable)
3. معطل افتراضياً

### فحص التشغيل
```bash
# التحقق من dataLayer في console
console.log(window.dataLayer)

# يجب أن يظهر: gtm.js event + client_context + page_view
```

---

## 11. نظام SEO Cache

**المبدأ:** بدل توليد Meta Tags + JSON-LD عند كل زيارة، يُولَّدان مرة واحدة عند الحفظ ويُخزَّنان في قاعدة البيانات.

### الوضع الحالي
| العنصر | Cache يعمل؟ | ملاحظة |
|--------|-----------|--------|
| المقالات | ✅ كامل | يقرأ كل الإعدادات |
| العملاء | ✅ يعمل | يقرأ env vars فقط (لا Settings) |
| الفئات | ⚠️ جزئي | يقرأ رابط الموقع بس، مو كل Settings |
| التاقات | ❌ لا يعمل | الحقول موجودة لكن لا مولد |
| الصناعات | ❌ لا يعمل | نفس وضع التاقات |

### القواعد الثابتة
1. كل حفظ أو تعديل = cache يتولد تلقائياً
2. لا قيمة ثابتة في الكود — كل شيء يُقرأ من جدول Settings
3. الموقع العام يقرأ الـ cache أولاً؛ لو ما في → يولد fallback بسيط
4. `revalidatePath` تُستدعى بعد كل حفظ
5. لو المولد فشل، الحفظ لا يتوقف

### ما يُولَّد لكل عنصر
**Meta Tags:** عنوان، وصف، canonical، OpenGraph (عنوان + وصف + صورة + alt)، Twitter card، robots
**JSON-LD للفئات/التاقات/الصناعات:** CollectionPage + BreadcrumbList + DefinedTerm
**JSON-LD للمقالات:** Article + Organization + Person (كاتب) + FAQPage (اختياري)
**JSON-LD للعملاء:** Organization كامل + WebSite + WebPage + شعار + وسائل التواصل

---

## 12. Monorepo — مرجع سريع

```yaml
# pnpm-workspace.yaml
packages:
  - 'admin'
  - 'modonty'
  - 'console'
  - 'dataLayer'
```

```bash
# التطوير
pnpm dev:modonty
pnpm dev:admin
pnpm dev:console

# البناء
pnpm build:all
pnpm build:modonty

# Prisma
pnpm prisma:generate
pnpm prisma:studio
```

**قاعدة البيانات:** MongoDB Atlas (لازم M10+ في production)
**Framework:** Next.js App Router — جميع التطبيقات
**Schema:** `dataLayer/prisma/schema/schema.prisma` — مشترك للكل

---

## 13. الشات بوت — نظرة سريعة

**المنطق الأساسي:**
- سؤال خارج نطاق الموضوع → رسالة out-of-scope
- سؤال في النطاق + مقالات مطابقة في DB → redirect cards
- سؤال في النطاق + لا مقالات → Serper web search + روابط مصادر

**المتطلبات:** `COHERE_API_KEY` + `SERPER_API_KEY` في env

**اختبار سريع:**
```bash
cd modonty
pnpm run test:chatbot-rag      # يجب 4/4 passed
pnpm run test:chatbot-cases    # يحتاج session cookie
```

---

## 14. الأداء — الإصلاحات المطبقة

| المشكلة | الإصلاح |
|---------|---------|
| Legacy JS (14 KiB زائدة) | TypeScript target → ES2022، browserslist → chrome/edge/ff 111+ |
| LCP بطيء (2.8 ثانية) | `fetchPriority="high"` على LCP image، إزالة w_auto من Cloudinary |
| ISR معطل | إزالة `force-dynamic`، إضافة `revalidate = 3600` |
| أول صورة بدون أولوية | `priority={index === 0}` في InfiniteArticleList |

**الهدف:** Lighthouse Mobile 91+

---

## 15. متغيرات البيئة الضرورية (Production)

```env
# Auth
NEXTAUTH_URL=https://admin.modonty.com
AUTH_SECRET=<قوي ومعقد>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Database
DATABASE_URL=mongodb+srv://...   # M10+ مو M0

# Email
RESEND_API_KEY=...
RESEND_FROM=noreply@modonty.com

# Media
CLOUDINARY_URL=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Analytics
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX

# AI
OPENAI_API_KEY=...     # أو GEMINI_API_KEY
COHERE_API_KEY=...     # للشات بوت RAG
SERPER_API_KEY=...     # للشات بوت Web Search

# SEO
NEXT_PUBLIC_SITE_URL=https://modonty.com
GOOGLE_SEARCH_CONSOLE_SITE_URL=...  # بدون trailing space!
```

---

> **هذا الملف هو المرجع الوحيد — أي وثيقة أخرى في المجلدات قابلة للتجاهل.**
> المصدر: مراجعة +100 ملف من: business-marketing، seo، analytics-gtm، technical-dev، performance، ai-chatbot، design-ui، intake-setup.
