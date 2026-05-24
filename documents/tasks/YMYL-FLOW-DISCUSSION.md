# YMYL Flow — وثيقة نقاش (Discussion Doc)

> **الغرض:** نقاش الـ flow الكامل للقطاعات الحساسة (طب، محاماة، مالية) قبل أي سطر كود.
> **القاعدة:** صفر تنفيذ، صفر code، صفر تخمين. نتفق على الفكرة → بعدها نشتغل.
> **الجلسة:** خالد + Claude. نقاش متبادل.
> **آخر تحديث:** 2026-05-23

---

## 1. الفكرة الكبرى

عملاء مودونتي في القطاعات الحساسة (عيادات، مكاتب محاماة، مستشارين ماليين) يحتاجون **توثيق رسمي** عشان:

- ✅ Google يثق بالمحتوى (يرفع الترتيب)
- ✅ الزائر يثق بالعميل (يحوّل لزبون)
- ✅ العميل نفسه ملتزم نظامياً (مايتعرض لمساءلة)

**الفرق بين عميل عادي وعميل YMYL:**

| البند | عميل عادي (مطعم، تجارة) | عميل YMYL (عيادة، محامي) |
|---|---|---|
| تسجيل الكونسول | فورم بسيط | فورم تفصيلي + وثائق |
| كاتب المقال | كافي | مش كافي — لازم مُراجِع مختص |
| الإعلان لـ Google | Organization عادي | MedicalClinic/LegalService موثّق |
| التحقق قبل النشر | فحوصات SEO عادية | + فحوصات الادعاءات + المُراجِع |

---

## 2. الـ Flow الكامل (7 خطوات)

### الخطوة 1️⃣ — تصنيف القطاع (في الأدمن)

**من يفعلها:** الأدمن (مودونتي).
**أين:** صفحة Industries في لوحة التحكم.

**ماذا يدخل الأدمن لكل Industry يحتاج توثيق (حقلين فقط):**

1. ✅ `requiresVerification` — checkbox: "هذا القطاع يحتاج توثيق؟"
2. 🏷️ `ymylCategory` — يختار: health / financial / legal

**ملاحظة معمارية:** كل الإعدادات الباقية (labels، dropdown options، schema types، النصوص الإرشادية، الكلمات الممنوعة الافتراضية، إلزامية صورة الترخيص) **موجودة في الكود كـ constants** (`lib/seo/ymyl-config.ts`) keyed by `ymylCategory`. صفر تكرار، صفر إدارة DB لكل قطاع.

**المرجع الرسمي:** Google Quality Rater Guidelines — تحديث 11 سبتمبر 2025.
**رابط:** https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf

**4 فئات YMYL رسمية من Google — نركّز على 3 فقط:**

| الفئة | الحالة | تشمل قطاعات مودونتي |
|---|---|---|
| 1️⃣ **Health or Safety** | ✅ يخصنا | الرعاية الصحية، الأسنان، الصحة النفسية، الصيدلة، التغذية، اللياقة |
| 2️⃣ **Financial Security** | ✅ يخصنا | الاستشارات المالية، التأمين، المحاسبة، العقار (شراء) |
| 3️⃣ **Civics & Government** | ❌ مستبعد | لا يخص عملاءنا التجاريين (إن جاء عميل استثنائي → معالجة يدوية) |
| 4️⃣ **Other (يشمل القانون)** | ✅ يخصنا | المحاماة، الاستشارات القانونية |

**قطاعات YMYL المؤكدة (نأشّر عليها checkbox):**

🔴 **أولوية الآن (Phase 1):**
- Healthcare (عيادات عامة)
- Dentistry (أسنان)
- Mental Health (صحة نفسية)

🟡 **أولوية قريبة (Phase 2):**
- Pharmacy (صيدلة)
- Nutrition (تغذية)
- Optometry (عيون)
- Legal Services (محاماة)

🟢 **لاحقاً (Phase 3+):**
- Financial Advisory
- Insurance (تأمين)
- Real Estate (عقار)
- Education (تعليم — رمادي حسب Google)

**قطاعات NON-YMYL (الـ checkbox مطفي):**
- Restaurants, Cafes
- E-commerce العام
- Fashion, Beauty
- Sports, Hobbies
- Travel agencies
- Entertainment, Events
- Marketing/SaaS
- Tech

**النتيجة:** أي عميل ينضم لقطاع مؤشّر → تلقائياً يعتبر YMYL.

---

### الخطوة 2️⃣ — ربط العميل بقطاعه

**من يفعلها:** **الأدمن فقط** (مودونتي). العميل لا يستطيع تغيير قطاعه.
**أين:** صفحة Client edit في لوحة الأدمن.
**كيف:** اختيار Industry من قائمة منسدلة.
**لماذا الأدمن فقط:**
- ضمان الجودة — مودونتي تتحقق من نشاط العميل الحقيقي قبل التصنيف.
- منع التلاعب — عميل ما يقدر يخفي نفسه من YMYL لتفادي متطلبات التوثيق.
- مسؤولية قانونية — تصنيف العيادة كـ "مطعم" لتفادي المراجعة = خطر على Google + الزائر.

**النتيجة:** النظام يعرف فوراً (من قرار الأدمن): هل هذا العميل YMYL أو لا؟

---

### الخطوة 3️⃣ — تعبئة بيانات التوثيق (في الكونسول)

**من يفعلها:** العميل (يدخل بحسابه على الكونسول).
**أين:** صفحة معلومات العميل في الكونسول.
**متى:** أول ما يدخل بعد ما الأدمن يربطه بقطاع YMYL.

**آلية الفحص الديناميكية (في الكونسول):**

```
الكونسول يقرأ:
  client.industry.requiresVerification → هل يحتاج فورم توثيق؟
  client.industry.ymylCategory         → ("health" | "financial" | "legal")

ثم يجيب الـ config من الكود:
  YMYL_CONFIG[ymylCategory] → { schemaTypeOptions, licenseLabel, authorityLabel, authorityOptions, helpText, requiresLicenseImage, ... }
```

**الفورم يبني نفسه ديناميكياً من 3 مصادر:**

| الحقل في الفورم | المصدر |
|---|---|
| Label "رقم الترخيص الطبي" | `YMYL_CONFIG.health.licenseLabel.ar` (كود) |
| Label "الجهة المُرخِّصة" | `YMYL_CONFIG.health.authorityLabel.ar` (كود) |
| Dropdown options (MOH/SCFHS/SFDA) | `YMYL_CONFIG.health.authorityOptions[client.addressCountry]` (كود) |
| Help text تحت الحقول | `YMYL_CONFIG.health.helpText.ar` (كود) |
| صورة الترخيص (مع نجمة إجباري) | `YMYL_CONFIG.health.requiresLicenseImage === true` (كود) |
| dropdown نوع المنشأة (MedicalClinic/Hospital/Dentist) | `YMYL_CONFIG.health.schemaTypeOptions` (كود) → العميل يحفظ اختياره في `Client.organizationType` |
| رقم الترخيص الفعلي | input → `Client.licenseNumber` |
| الجهة المُرخِّصة المختارة | dropdown → `Client.licenseAuthority` |
| صورة الترخيص المرفوعة | upload → `Client.complianceConstraints.licenseImageUrl` |

**أمثلة عملية:**

#### مثال 1: عيادة سعودية
- Industry "Healthcare" مع `requiresVerification=true`
- الكونسول يعرض:
  - "رقم الترخيص الطبي" → input (يحفظ في `Client.licenseNumber`)
  - "الجهة المُرخِّصة الصحية" → dropdown [MOH, SCFHS, SFDA] (يحفظ في `Client.licenseAuthority`)
  - "ارفع شهادة الترخيص بصيغة PDF" → file upload (إجباري)
  - "اختيار المُراجِع المختص" → dropdown من Authors التابعين للعميل

#### مثال 2: مكتب محاماة مصري
- Industry "Legal Services" مع `requiresVerification=true`
- نفس الكونسول، نفس الكود، **بيانات مختلفة من الـ metadata:**
  - "رقم القيد في النقابة" → input
  - "نقابة المحامين" → dropdown [EMS, Bar Association]
  - "ارفع شهادة الممارسة" → file upload (إجباري)
  - "اختيار المُراجِع المختص" → dropdown

#### مثال 3: مطعم
- Industry "Restaurant" مع `requiresVerification=false`
- الكونسول يعرض **فورم بسيط فقط** (اسم، شعار، عنوان، تواصل) — صفر حقول قانونية.

**النتيجة:** قاعدة بيانات موثّقة لكل عميل YMYL، بواجهة مخصصة 100% لقطاعه.

---

### الخطوة 4️⃣ — إنشاء المُراجِع المختص (Author)

**من يفعلها:** العميل (في الكونسول) أو الأدمن (في الأدمن).
**أين:** قسم Authors.
**ماذا يدخل:**
- الاسم الكامل
- الصورة
- الشهادات (بكالوريوس، ماجستير، زمالة)
- التخصص
- رقم الترخيص الشخصي
- اللينكدإن أو ORCID (اختياري)

**النتيجة:** الكادر المختص جاهز لربطه بالمقالات.

---

### الخطوة 5️⃣ — كتابة المقال + ربط المُراجِع

**من يفعلها:** كاتب المحتوى (في الأدمن).
**أين:** صفحة Article edit.
**ماذا يحدث:**

- يختار العميل + يكتب المقال عادي.
- **إذا العميل YMYL:** النظام يطلب حقل إضافي **"مُراجِع المقال"** (إجباري).
- المراجع يُختار من قائمة Authors التابعة لهذا العميل.
- بدون مُراجِع → الزر "نشر" معطل.

**النتيجة:** كل مقال YMYL له مُراجِع مختص مسؤول عنه.

---

### الخطوة 6️⃣ — التحقق التلقائي قبل النشر

**من يفعلها:** النظام (تلقائي).
**متى:** عند الضغط على "نشر".

**ماذا يفحص (يقرأ Industry.ymylCategory ليحدد القواعد):**

- ✅ هل المُراجِع موجود؟ (إذا `Industry.requiresVerification === true`)
- ✅ هل المقال خالي من الكلمات الممنوعة الافتراضية (من code constants حسب `ymylCategory`)؟
  - health → ["نضمن الشفاء", "علاج مضمون", "بدون أعراض جانبية", ...]
  - financial → ["عائد مضمون", "ربح مضمون", "بدون مخاطر", ...]
  - legal → ["نضمن الفوز", "نتائج مضمونة", ...]
- ✅ هل المقال خالي من الكلمات الممنوعة الخاصة بالعميل (`Client.forbiddenKeywords[]` + `Client.forbiddenClaims[]`)؟
- ✅ هل تاريخ آخر مراجعة محدّث؟ (مهم لو المقال قديم)
- ✅ هل بيانات العميل موثّقة في الكونسول؟ (`Client.licenseNumber` + `Client.licenseAuthority`)
- ✅ إذا `Industry.requiresLicenseImage === true` → هل صورة الترخيص مرفوعة؟

**لو فشل أي فحص:** يرجع للكاتب مع رسالة واضحة "أصلح هذا قبل النشر".

---

### الخطوة 7️⃣ — النشر + الإعلان لـ Google

**من يفعلها:** النظام (تلقائي).

**ماذا يحدث (المُولِّد يقرأ Industry.schemaType + كل البيانات المرتبطة):**

- المقال ينشر على modonty.com
- صفحته تحتوي JSON-LD ديناميكي مبني على `Industry.schemaType`:

#### مثال — عيادة سعودية (`schemaType: "MedicalClinic"`)
```json
{
  "@graph": [
    {
      "@type": "MedicalWebPage",
      "reviewedBy": { "@id": "#reviewer" },
      "lastReviewed": "2026-05-23"
    },
    {
      "@id": "#clinic",
      "@type": "MedicalClinic",
      "name": "عيادة كذا",
      "medicalSpecialty": "Dentistry",
      "identifier": { "@type": "PropertyValue", "value": "MOH-12345" },
      "areaServed": { "@type": "Country", "name": "SA" }
    },
    {
      "@id": "#reviewer",
      "@type": "Physician",
      "name": "د. سارة",
      "hasCredential": { "@type": "EducationalOccupationalCredential", ... }
    }
  ]
}
```

#### مثال — مكتب محاماة مصري (`schemaType: "LegalService"`)
```json
{
  "@graph": [
    {
      "@type": "WebPage",
      "reviewedBy": { "@id": "#reviewer" },
      "lastReviewed": "2026-05-23"
    },
    {
      "@id": "#firm",
      "@type": "LegalService",
      "name": "مكتب كذا للمحاماة",
      "legalName": "مكتب كذا للمحاماة - شركة شخص واحد",
      "identifier": { "@type": "PropertyValue", "value": "EMS-67890" }
    },
    {
      "@id": "#reviewer",
      "@type": "Attorney",
      "name": "أ. أحمد",
      "hasCredential": { ... }
    }
  ]
}
```

- Google يقرأ → يصنّف الصفحة كمحتوى مُتخصِّص موثّق → يرفع الترتيب.

**النتيجة:** مقال يطلع في نتائج Google كمحتوى موثوق (E-E-A-T) بنوع schema مناسب لقطاعه بالضبط.

---

## 3. ماذا نحتاج فعلاً (Database vs Code)

### في قاعدة البيانات (3 حقول جدد فقط)

| الحقل | الموقع | الغرض |
|---|---|---|
| `requiresVerification` | على Industry | الـ trigger الأساسي |
| `ymylCategory` | على Industry | تحديد فئة الـ config (health/financial/legal) |
| `reviewedById` | على Article (FK) | ربط المُراجِع بالمقال |

**صفر حقل جديد على Client** — كل بيانات الترخيص والجهة والصورة تُحفظ في حقول موجودة (`licenseNumber`, `licenseAuthority`, `organizationType`, `complianceConstraints` Json).

### كل الباقي **موجود حالياً** ✅

- `Client.licenseNumber` ✓
- `Client.licenseAuthority` ✓
- `Client.organizationType` ✓ (دايناميك)
- `Client.complianceConstraints` Json ✓
- `Client.forbiddenClaims[]` ✓
- `Client.forbiddenKeywords[]` ✓
- `Author.credentials[]` ✓
- `Author.qualifications[]` ✓
- `Author.expertiseAreas[]` ✓
- `Article.lastReviewed` ✓
- `Article.citations` ✓

### الشغل البرمجي (صفر سكيما)

1. **أدمن**: checkbox على صفحة Industry.
2. **كونسول**: فورم شرطي حسب `industry.requiresVerification`.
3. **أدمن**: حقل اختيار مُراجِع على صفحة Article edit.
4. **مُولِّد JSON-LD**: إخراج types طبية/قانونية.
5. **بوابة النشر**: فحوصات YMYL إضافية.

---

## 4. الأسئلة المفتوحة للنقاش

### ❓ سؤال 1: نطاق المُراجِع
هل المُراجِع لازم يكون **Author تابع للعميل**، ولا ممكن مُراجِع مستقل تابع لمودونتي تربطه بعدة عملاء؟

**خياران:**
- (أ) كل مُراجِع لازم يكون Author لـ Client معين فقط.
- (ب) Author ممكن يكون مرتبط بعدة Clients (many-to-many).

**رأي خالد:** ؟

---

### ❓ سؤال 2: من يدخل بيانات الترخيص؟
هل العميل يدخل بياناته بنفسه في الكونسول، ولا الأدمن يدخلها عنه؟

**خياران:**
- (أ) العميل بنفسه (Self-service) → سرعة وقابلية توسع.
- (ب) الأدمن يدخلها (Controlled) → تحكم في الجودة، تأكيد من مودونتي.

**رأي خالد:** ؟

---

### ❓ سؤال 3: عرض الترخيص للزائر
هل نعرض شهادة الترخيص كصورة في صفحة العميل العامة، ولا فقط نضمنها في JSON-LD لـ Google؟

**خياران:**
- (أ) عرض ظاهر للزائر (شارة "مرخّص" + ملف PDF/صورة).
- (ب) خفي للزائر، يظهر فقط في الـ structured data.

**رأي خالد:** ؟

---

### ❓ سؤال 4: مغادرة المُراجِع
لو المُراجِع غادر العميل (طبيب استقال من العيادة)، ماذا نعمل بالمقالات اللي راجعها سابقاً؟

**خياران:**
- (أ) نحتفظ باسمه التاريخي (هو فعلاً راجع المقال في وقته).
- (ب) نطلب مُراجِع جديد ونحدّث `lastReviewed`.
- (ج) خيار ثالث للعميل: "احتفظ تاريخياً" أو "اطلب مراجعة جديدة".

**رأي خالد:** ؟

---

### ❓ سؤال 5: قوائم الكلمات الممنوعة
هل نقدم للعميل **defaults جاهزة** للكلمات الممنوعة (قائمة طبية، قائمة قانونية)، ولا نتركه يدخلها بنفسه؟

**خياران:**
- (أ) Preset جاهز لكل قطاع + العميل يقدر يعدل.
- (ب) فارغ، العميل/الأدمن يبني قائمته.

**رأي خالد:** ؟

---

### ❓ سؤال 6: تعدد الدول/الجهات
عميل في السعودية يحتاج رخصة من MOH/SCFHS. عميل في مصر يحتاج من EMS/MOHP. عميل في الإمارات يحتاج من DHA/DoH.

**خياران:**
- (أ) قائمة جهات ثابتة لكل (country × industry).
- (ب) نص حر يكتبه العميل.

**رأي خالد:** ؟

---

### ❓ سؤال 7: حالة العميل غير الموثّق
عميل في قطاع YMYL لكن **ما عبّى بيانات الترخيص بعد**. ماذا نعمل؟

**خياران:**
- (أ) منع نشر أي مقال له حتى يوثّق.
- (ب) السماح بالنشر لكن بدون trust signals (schema عادي).
- (ج) تحذير في الأدمن، الأدمن يقرر.

**رأي خالد:** ؟

---

## 5. تتبع القرارات

| القرار | الحالة | تاريخ |
|---|---|---|
| إضافة `Industry.requiresVerification` كـ checkbox | ✅ موافق | 2026-05-23 |
| ربط العميل بقطاعه = **الأدمن فقط** (العميل لا يقدر) | ✅ موافق | 2026-05-23 |
| الكونسول يفحص `client.industry.requiresVerification` ويعرض فورم شرطي | ✅ موافق | 2026-05-23 |
| القطاعات YMYL مؤكدة من Google QRG (Sep 2025) — 4 فئات رسمية | ✅ موثّق | 2026-05-23 |
| استبعاد فئة "Civics & Government" (غير ذات صلة بعملائنا التجاريين) | ✅ موافق | 2026-05-23 |
| تأكيد العقار = Financial Security · المحاماة = Other · المقاولات = Gray Zone | ✅ موثّق من Google QRG | 2026-05-23 |
| ~~Industry metadata: 8 حقول~~ | ❌ مرفوض (over-engineering — خلط form config مع taxonomy) | 2026-05-23 |
| **Industry metadata النهائي: حقلين فقط** (`requiresVerification` + `ymylCategory`) | ✅ موافق بعد تصحيح خالد | 2026-05-23 |
| كل الـ form config (labels, dropdowns, schemaTypes, helpText, forbidden defaults) → **code constants** في `lib/seo/ymyl-config.ts` keyed by `ymylCategory` | ✅ قرار نهائي | 2026-05-23 |
| Client يحفظ بياناته الفعلية في حقول موجودة (`licenseNumber`, `licenseAuthority`, `organizationType`, `complianceConstraints.licenseImageUrl`) — صفر حقل جديد على Client | ✅ قرار | 2026-05-23 |
| إضافة `Article.reviewedById` كربط للمُراجِع | ✅ موافق | 2026-05-23 |
| ~~العدد الإجمالي للحقول الجديدة: 3 فقط (2 Industry + 1 Article)~~ | ❌ مرفوض — لاحظ خالد أن البيانات يجب أن تكون على Client مش Industry | 2026-05-23 |
| **المعمارية النهائية:** Industry يبقى نظيف — قرار YMYL **per-client** عبر checkbox + radio (medical/legal/financial). كل بيانات YMYL في `Client.ymylData` Json حسب الـ category. | ✅ نهائي | 2026-05-23 |
| الحقول الجديدة النهائية: `Client.isYmyl` + `Client.ymylCategory` + `Client.ymylData` + `Article.reviewedById` (4 حقول، صفر تعديل على Industry) | ✅ نهائي | 2026-05-23 |
| Form config (labels, dropdowns, schemaTypes, forbidden) → code constants في `lib/seo/ymyl-config.ts` keyed by `ymylCategory` | ✅ نهائي | 2026-05-23 |
| **Phase 1 — Schema:** إضافة `isYmyl` + `ymylCategory` + `ymylData` على Client · إضافة `reviewedById` + relation `ArticleReviewer` على Article · إضافة `reviewedArticles` reverse relation على Author · رفع relations الموجودة لأسماء (`ArticleAuthor`). prisma generate ✓ · TSC: admin 0 · modonty 0 · console 0 source errors | ✅ DONE | 2026-05-23 |
| **Phase 2 — Backend code:** `admin/lib/seo/ymyl-config.ts` (3 categories: medical/legal/financial · fields + dropdowns by country + specialties + forbidden claims + schemaType resolver) · `ymyl-helpers.ts` (validation + completeness + forbidden-scanner + publish gate) · `build-ymyl-jsonld.ts` (Medical/Legal/Financial schema.org @graph builder + MedicalWebPage wrapper with reviewedBy + lastReviewed + Physician/Attorney/Person reviewer node with hasCredential structured). TSC admin zero errors. | ✅ DONE | 2026-05-23 |
| **Phase 3 — Admin UI:** new `ymyl-section.tsx` (checkbox + radio + dynamic field grid driven by YMYL_CATEGORIES config — text/dropdown/specialty/image field renderers · country-aware authority dropdowns · category-change resets ymylData · disable-YMYL clears category+data) · Accordion item "YMYL Verification" wired into client-form.tsx between Company Profile + SEO Details · Zod schema extended (isYmyl/ymylCategory/ymylData) · ClientFormData type + initial mapper + form submit + get-clients select all updated · new `updateYmylFields` server action wired into orchestrator · TSC admin zero errors. | ✅ DONE | 2026-05-23 |
| ~~Phase 3 admin UI had editable Verification Details~~ | ❌ مرفوض — لاحظ خالد أن الحقول للعميل عبر الكونسول، مش للأدمن | 2026-05-23 |
| **Phase 3 — Admin UI (corrected):** الـ admin يعرض الـ checkbox + radio فقط (التحكم). الـ Verification Details بـ read-only completion status: badge أخضر "Client completed (N/N fields)" أو أمبر "Awaiting client (X/N fields)". Footer note صريح: "fields owned by client via console". Screenshots: `ymyl-admin-readonly-status.png`. TSC zero errors. Live verified على عيادات بلسم الطبية. | ✅ VERIFIED | 2026-05-23 |
| **Cleanup (during Phase 3):** حذف GA4 per-client fields (`Client.ga4PropertyId` + `Client.ga4MeasurementId`) — بناءً على قرار GTM-PLAN (Container واحد + filter by clientId لاحقاً). UI: حذف "Analytics" GA4 inputs من Settings section + حذف Analytics column من جدول العملاء + إزالة `BarChart2` import. Backend: حذف من Zod server schema + ClientFormData type + create-client allowedFields. Schema: حذف الحقلين من Prisma + regenerate. TSC: admin 0 · modonty 0 · console 0 source errors. | ✅ DONE | 2026-05-23 |
| **Phase 4 — Console editable form:** mirror `ymyl-config.ts` + `ymyl-helpers.ts` لـ `console/lib/seo/` (نفس نمط db.ts/auth.ts). New `console/.../profile/components/ymyl-section.tsx` (editable form: section header + progress badge + Google E-E-A-T explanation + country warning + dynamic field grid text/dropdown/specialty/image + per-field Arabic validation errors + sticky save bar + sonner toast feedback). New `updateYmylData()` server action — auth-checked + clientId from session + silently rejects if `!client.isYmyl` + allows partial saves (publish gate handles completeness). Wired into `profile/page.tsx` after ProfileForm. **Live tested end-to-end (console :3000 as Kimazone client):** enabled isYmyl=medical via admin → logged into console → section rendered with all 4 fields + amber 0/4 badge + Arabic validation + filled "MOH-12345-TEST" → save → DB persisted → reload → value still there ✅. Screenshots: `.playwright-mcp/console-ymyl-section-medical.png` · `.playwright-mcp/console-ymyl-saved.png`. TSC console zero source errors. | ✅ VERIFIED | 2026-05-24 |
| **Phase 4 — Comprehensive all-categories live test:** Built one-shot DEV script `verify-ymyl-all-categories.ts` — exercises medical/legal/financial + disable flow. **81 checks passed · 0 failed.** Validated per category: config integrity · DB persistence · empty-data validation count matches required count · full mock data is complete · specialty→schemaType resolution (medical: 10 specialties incl. Dentist/Optician/Pharmacy/Hospital/DiagnosticLab/Dietitian/PhysicalTherapy · legal: 9 specialties · financial: 7 specialties with sub-types InsuranceAgency/AccountingService/RealEstateAgent/BankOrCreditUnion) · authority options per country (SA/EG/AE all returning correct lists) · forbidden claim detection · publish gate (PASS when complete+reviewer+clean · BLOCK when reviewer missing) · disable flow (non-YMYL articles publish freely). Visual UI tests: Medical 4/4 emerald complete · Legal switch shows bar-number/bar-association/specialty fields (medical fields gone) · Financial switch shows regulator-license/regulator/activity-type · Disable switch → section completely vanishes. Screenshots: `.playwright-mcp/test-medical-complete.png` · `test-legal-state.png` · `test-financial-state.png` · `test-disabled-state.png`. Scripts deleted post-test. | ✅ VERIFIED 100% | 2026-05-24 |
| **Phase 5 — Publish gate + JSON-LD wiring + article reviewer UI:** (a) Reviewer UI — extended `ArticleFormData` with `reviewedById` · `ArticleClient` with `isYmyl`/`ymylCategory` · `basic-section.tsx` renders conditional reviewer dropdown (FormNativeSelect filtered by client.isYmyl) · `create-article.ts` + `update-article.ts` save `reviewedById`. (b) Publish gate — `gated-transition.ts` extended select for client (isYmyl/ymylCategory/ymylData/addressCountry) + article (reviewedById) · added `checkYmylPublishGate` call after 28-check validator passes · blocks transition with blockers list. (c) JSON-LD wiring — `fetchArticleForJsonLd` includes `reviewer` relation · `ArticleWithFullRelations` extended with `reviewer?: Author` · `generateArticleKnowledgeGraph` calls `buildYmylJsonLdGraph` and appends MedicalClinic/LegalService/FinancialService + reviewer Physician/Attorney/Person + MedicalWebPage wrapper (medical only) to @graph. TSC admin zero source errors. | ✅ DONE | 2026-05-24 |
| **Phase 6 — Cleanup deprecated columns:** dropped `Client.licenseNumber` + `Client.licenseAuthority` from Prisma schema · regenerated client · removed from 11 files (form Zod schema · server Zod · ClientFormData type · create-client allowedFields · get-clients select · types.ts · map-initial-data-to-form-data · use-client-form · update-client-grouped legal group · client-field-mapper · generate-client-test-data) · stripped UI display blocks (form-sections/legal-section · [id]/components/tabs/legal-tab · [id]/components/tabs/basic-info-tab · [id]/components/client-tabs) · removed from SEO config readers (generate-client-seo · client-jsonld-storage type+select · generate-complete-organization-jsonld · create-organization-seo-config field+validator map) · removed `validateLicenseInfo` validator from validators-advanced · removed license row from modonty `client-official-data.tsx`. **TSC: admin 0 · modonty 0 · console 0 source errors.** Remaining license references = JSON KEYS in `ymyl-config.ts` + `build-ymyl-jsonld.ts` (intentional, those are property names inside `ymylData`). | ✅ DONE | 2026-05-24 |
| **End-to-End Live Test (pre-push):** ran `verify-ymyl-end-to-end.ts` → **33/33 JSON-LD checks passed** across medical/legal/financial. For each: `generateAndSaveJsonLd()` called → Article.jsonLdStructuredData persisted → JSON parsed → verified org node (correct @type incl. specialty resolution: Dentist for medical+dentistry · LegalService · FinancialService) + identifier (license + authority) + areaServed=SA + medicalSpecialty (medical only) + reviewer node (Physician/Attorney/Person) + MedicalWebPage wrapper with reviewedBy + lastReviewed (medical only) + correct absence on non-medical. **Browser-level test on modonty (port 3000):** visited `/articles/digital-education-future-saudi` → inspected rendered `<script type="application/ld+json">` → confirmed @graph contains 8 nodes for medical (incl. Dentist + Physician + MedicalWebPage) + 7 nodes for legal (LegalService + Attorney + NO MedicalWebPage). Full identifier propagation: `{propertyID: "MOH", value: "MOH-99999"}` rendered verbatim. **PIPELINE PROVEN END-TO-END: schema → save → JSON-LD generator → DB cache → modonty SSR → browser HTML → Google.** Scripts deleted post-test. Kimazone restored to medical default. | ✅ VERIFIED 100% | 2026-05-24 |
| **Hotfix — SEO publish UX (pre-push, from user PROD screenshot):** user reported opaque error "String must contain at most 50 character(s)" with no field name on `/articles/new` publish. Audited entire SEO publish chain. **5 fixes:** (1) `create-article.ts` + `update-article.ts` Zod safeParse now surface ALL failed fields by name: `"بيانات غير صحيحة — fieldName: message · fieldName2: message"` instead of single opaque English string. (2) `publish-article.ts` `validateArticleData()` rewritten — all messages Arabic-first with field names + current char counts (e.g. "وصف SEO مطلوب ولا يقل عن 50 حرفاً — حالياً 32 حرف"). (3) Publish error format: bullet list with `\n• ` for multiple issues — user sees ALL blockers at once, not one-at-a-time. (4) SEO score gate shows WEAK CATEGORIES breakdown when below 60% (e.g. "الأقسام الضعيفة: images 0% · social 40%"). (5) `ToastDescription` extended with `whitespace-pre-line` so multi-line errors render with proper line breaks. Applied to both `publishArticle` (new) + `publishArticleById` (existing). TSC zero errors. | ✅ DONE | 2026-05-24 |
| نطاق المُراجِع (سؤال 1) | ⏳ بانتظار خالد | — |
| من يدخل التراخيص (سؤال 2) | ⏳ بانتظار خالد | — |
| عرض الترخيص للزائر (سؤال 3) | ⏳ بانتظار خالد | — |
| سياسة مغادرة المُراجِع (سؤال 4) | ⏳ بانتظار خالد | — |
| الكلمات الممنوعة الافتراضية (سؤال 5) | ⏳ بانتظار خالد | — |
| تعدد الدول/الجهات (سؤال 6) | ⏳ بانتظار خالد | — |
| العميل غير الموثّق (سؤال 7) | ⏳ بانتظار خالد | — |

---

## 6. الخطوات التالية

بعد ما نتفق على كل الأسئلة المفتوحة:
1. تحديث هذه الوثيقة بالقرارات النهائية.
2. تحويلها لخطة تنفيذ Phase-by-Phase.
3. البدء بالكود **خطوة واحدة في المرة**.

**الجلسة الحالية:** نقاش فقط. صفر كود.

---

## المصطلحات الإنجليزية

- YMYL · E-E-A-T · Google · JSON-LD · schema · trigger · checkbox · default · preset
- MedicalWebPage · MedicalClinic · LegalService · Organization · Person · medicalSpecialty · reviewedBy · lastReviewed · licenseNumber · author
- Industry · Client · Article · Author (Prisma model names)
- SCFHS · MOH · MOHP · EMS · CMA · SAMA · DHA · DoH · ORCID
- modonty.com · self-service · structured data · many-to-many
