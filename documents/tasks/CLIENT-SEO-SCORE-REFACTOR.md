# Client SEO Score — Refactor toward 100% perfection

> الهدف: **Meta score 100% صحيح** + **JSON-LD score 100% صحيح**، مفصولين، معزولين تحت
> `dataLayer/lib/seo/client/`، مبنيين على **حقول العميل الحقيقية** + **المصادر الرسمية**،
> أذكياء (يفرّقون بين ما يوفّره العميل وما توفّره إعدادات المنصّة).
>
> Last Updated: 2026-05-31 · الحالة: **مرحلة المراجعة — صفر كود حتى تأكيد خالد.**

---

## 0) تعريف 100% المعتمد (خالد — 2026-05-31)

**100% = صحّة فعلية (VALIDITY)، مش عدّ حقول (count).**
- **Meta 100%** = سليمة لـ Google وكل محركات البحث: title بالطول الصح وفريد · description فريد بالطول الصح · OG image بالأبعاد الصح · canonical صحيح · hreflang. أي محرّك يقرأها صح.
- **JSON-LD 100%** = صحيح بنيوياً حسب schema.org/Google best practices: الأنواع صح · الحقول الموصى بها موجودة · **صفر أخطاء validation**.

**التداخل (NESTING) — مبدأ معماري:** المشروع متداخل:
```
Client (Organization)
  └─ logo/address/geo/contactPoint/parentOrganization …
Article (BlogPosting)
  ├─ publisher → Client (Organization)
  ├─ author → Author
  └─ tags / categories
```
كل كيان له Meta + JSON-LD مترابطين بـ `@id`. فالـ score = **نظام موحّد قابل للتوسّع**: نبدأ Client الآن، ثم Article/Tags بنفس النمط المعزول، مع احترام الروابط (Article.publisher لازم يشير لـ Client صحيح).

**القرار التقني المترتّب:** الـ JSON-LD validity **محسوب أصلاً** في `jsonLdValidationReport` (Adobe + Ajv، مخزّن في DB). → الـ JSON-LD score **يقرأ هذا التقرير** (صفر أخطاء = 100%) بدل إعادة اختراع validation. الـ Meta score = فحص صحّة الحقول (طول/وجود/أبعاد) مقابل قواعد Google.
*(بانتظار تأكيد خالد النهائي على بناء الـ score على validity بدل count.)*

---

## 1) الخلاصة التنفيذية (فين الخلل؟)

**في النظام منطقان للـ score اشتغلا في أوقات مختلفة، والخلل دخل لما وحّدنا على الأبسط:**

| | المنطق القديم (`client-seo-group-scores` + `client-field-mapping`) | المنطق الحالي (`client/seo-score.ts`) |
|---|---|---|
| المصدر | **حقول العميل الحقيقية** (`seoData` من الفورم/المخزّن) | مخرجات التوليد (`nextjsMetadata` + `jsonLdStructuredData`) |
| المقياس | كم **حقل مصدري** معبّى + جودته (طول، أبعاد صورة…) | هل **اتولّد** meta/JSON-LD (نعم دايماً) |
| المفصول؟ | ✅ نعم — `metaTags` flag + `jsonLd` flag لكل حقل | ❌ رقم واحد مدموج |
| الأوزان | ✅ مدروسة per-field (title=20, desc=18, logo=13, canonical=12…) | ثابتة خشنة (title20, desc20, img10, graph30, valid20) |
| الحجم | 964 سطر mapping + 174 سطر scoring | 81 سطر |
| النتيجة لعميل فاضي | **منخفضة حقيقية** (حقول فاضية = نقاط قليلة) | **70% وهمي** (الاسم إجباري → graph يتولّد → 50 نقطة من لا شيء) |

### الخلل بالضبط (3 أعطال)
1. **العطل الجوهري:** المنطق الحالي يقيس **«هل اتولّد JSON-LD؟»** — والجواب دايماً «نعم» لأن `name` إجباري. فأي عميل يبدأ من ~70% بلا أي إدخال. → **رقم كاذب.**
2. **فقدان التفصيل:** المنطق القديم كان يعطي تشخيص per-field (هذا الحقل ناقص، هذا قصير، هذه الصورة صغيرة). الحالي = ✓/✗ خشن لـ 4 بنود فقط.
3. **سبب التوحيد الخاطئ:** وحّدنا على الحالي (الأبسط) لأن القديم كان يقرأ من **الفورم الحيّ** (يتغيّر وأنت تكتب) بينما نبغى **DB المخزّن**. الحل الصح كان: **نأخذ ذكاء القديم (الحقول الحقيقية + الأوزان + الفصل) ونقرأه من DB**، مش نرمي القديم كله.

> **القرار:** لا نعيد القديم كما هو (مربوط بالفورم + SEODoctorConfig معقّد)، ولا نُبقي الحالي (كاذب).
> نبني calculator جديد معزول يجمع: **ذكاء القديم (حقول حقيقية + فصل + أوزان) + مصدر الحالي (DB) + المصادر الرسمية المحدّثة.**

---

## 2) المصادر الرسمية المعتمدة (تم التحقق منها)

- **Google — Organization structured data:** «**لا توجد حقول required**؛ أضف الموصى بها» → score = **اكتمال الموصى به**. (recommended: name, url, logo, address, telephone, email, contactPoint, description, sameAs, alternateName, legalName, foundingDate, vatID, taxID, naics, duns, numberOfEmployees…)
- **Google — LocalBusiness:** **required = `@type`, `name`, `address`** (مع streetAddress/addressLocality/addressRegion/postalCode/addressCountry). recommended: geo(lat/long ≥5 خانات), openingHoursSpecification, priceRange, telephone, url, image, aggregateRating…
- **Google — Title link:** كل صفحة title فريد ووصفي (يُقصّ حسب عرض الجهاز).
- **Google — Snippet/description:** وصف فريد لكل صفحة.
- **OGP.me:** **og:title, og:type, og:image, og:url إلزامية** للكائن الصحيح.
- **Next.js Metadata (Context7):** required = title + description; openGraph(title/description/images/url/siteName/locale/type); twitter(card/image); alternates.canonical + languages(hreflang).
- **schema.org/Organization (Context7):** كل الحقول المذكورة موجودة فعلاً على Organization (name, legalName, alternateName, url, logo, image, description, slogan, telephone, email, address, contactPoint, vatID, taxID, naics, duns, foundingDate, numberOfEmployees, knowsLanguage, areaServed, parentOrganization, sameAs).

---

## 3) الذكاء: مين مسؤول عن إيش (Settings vs Client)

**قاعدة:** ما توفّره إعدادات المنصّة = **لا يُحسب ضد العميل** (متوفّر دايماً).

| يوفّره Settings (منصّة — لا يُحسب) | يوفّره/يخص Client (يُحسب في الـ score) |
|---|---|
| siteName, siteUrl, inLanguage, defaultOgLocale | seoTitle, seoDescription, description |
| defaultMetaRobots, defaultTwitterCard | logoMediaId, heroImageMediaId |
| twitterSite, twitterCreator, OG image type/أبعاد | العنوان، sameAs، vatID، phone، إلخ |

---

## 4) META SCORE = 100 (Rubric مقترح — يقرأ حقول العميل من DB)

| البند | حقل DB | المصدر الرسمي | وزن |
|---|---|---|---|
| Title مخصّص (≠ الاسم، 30–60 حرف) | `seoTitle` | Google title-link · Next.js required | **25** |
| Description (120–160 حرف) | `seoDescription` | Google snippet · Next.js required | **25** |
| OG/Share Image (1200×630) | `heroImageMediaId` ← fallback `logoMediaId` | OGP.me og:image إلزامي | **25** |
| Canonical | `canonicalUrl` ← يُشتق من slug | Google + Next.js alternates | **10** |
| Language / hreflang | `knowsLanguage` | Next.js alternates.languages | **15** |
| (siteName/locale/robots/twitterSite) | — | **Settings — لا يُحسب** | — |

**ملاحظات جودة (من القديم — نحتفظ بها):** Title يُعاقب لو = الاسم الحرفي أو خارج 30–60. Description يُعاقب لو < 120 أو > 160. Image تُفحص أبعادها ≥ 1200×630.

---

## 5) JSON-LD SCORE = 100 (Rubric مقترح — Organization/LocalBusiness)

| الفئة | حقول DB | وزن |
|---|---|---|
| **هوية** | `name`✓ · `logoMediaId` · `description` · `alternateName` · `slogan` · `url` | 20 |
| **تواصل** | `phone` · `email`✓ · `contactType` · العنوان (`addressStreet`/`City`/`Region`/`PostalCode`/`Country`) | 25 |
| **حضور واقعي** | `sameAs` · `legalName` · `foundingDate` | 15 |
| **معرّفات أعمال** | `vatID` · `taxID` · `commercialRegistrationNumber` · `businessActivityCode`(→isicV4/naics) · `numberOfEmployees` | 10 |
| **Local SEO** | `addressLatitude`+`addressLongitude`(geo) · `openingHoursSpecification` · `priceRange` · `gbpPlaceId`(→hasMap) | 20 |
| **إضافات** | `knowsLanguage` · `industryId`(→areaServed) · `parentOrganizationId` · `keywords` | 10 |

**شرطي (ذكاء حسب نوع العميل):**
- لو `organizationType` = LocalBusiness/فرعي → العنوان الكامل يصير **إلزامي** (وزن أثقل)، غيره recommended.
- لو `isYmyl=true` → حقول `ymylData` (رخصة + جهة + مراجِع مؤهّل) تدخل كبنود **مطلوبة إضافية** في JSON-LD (E-E-A-T).

---

## 6) التصميم المعزول المقترح

```
dataLayer/lib/seo/client/
  ├── meta-score.ts      → computeClientMetaScore(client, settings?) → {score, checks[]}
  ├── jsonld-score.ts    → computeClientJsonLdScore(client) → {score, checks[]}
  ├── seo-score.ts       → يجمع الاثنين + رقم كلّي + checklist موحّد (للتوافق الحالي)
  └── field-weights.ts   → جدول الأوزان (مصدر واحد، يسهل التعديل) — مستوحى من client-field-mapping القديم
```

- يقرأ **حقول العميل الخام من DB** (مش مخرجات التوليد، مش الفورم الحيّ).
- نفس المصدر للسطوح الأربعة (قائمة/تفاصيل/SEO/كونسول) = نفس الرقم.
- المنطق القديم (`client-seo-group-scores` + `client-field-mapping` + SEODoctor) **يبقى** كأداة تشخيص حيّة في فورم التعديل (غرض مختلف) — لا نكسره.

---

## 7) قرارات مطلوبة من خالد قبل أي كود

1. **الأوزان** (الجدولان 4 و5) — مناسبة؟ أعدّل أي وزن؟
2. **الشرطي** (LocalBusiness address إلزامي + YMYL fields) — أطبّقه (score يتكيّف حسب نوع العميل)، ولا rubric ثابت للكل؟
3. **مصير القديم:** نُبقي `client-field-mapping.ts` (964 سطر) كمصدر أوزان نعيد استخدامه، ولا نبدأ `field-weights.ts` نظيف من الصفر بالـ rubric أعلاه؟
4. **«100% = الكمال»:** هل 100% = كل حقل في الجدولين معبّى (الطموح الأقصى)، ولا 100% = الحقول الأساسية فقط والباقي bonus؟ (يؤثر على شعور العميل: هل يوصل 100% واقعياً؟)
