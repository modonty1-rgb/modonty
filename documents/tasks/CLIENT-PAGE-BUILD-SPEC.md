# صفحة العميل — مرجع البناء الكامل (Build Spec)

> **هذا الملف = المصدر الوحيد للحقيقة (single source of truth) لبناء صفحة العميل المصغّرة `/clients/[slug]`.**
> صفر تخمين · صفر غلط · صفر مضيعة وقت. كل ما هو مكتوب هنا تمّ التحقّق منه من السكيما الفعلية ومن الـ docs الرسمية.
>
> - **العقد البصري (شكل الصفحة):** `documents/tasks/client-page-light-mockup.html` — **BUILD 15**.
> - **هذا الملف (العقد التقني):** السكيما + البيانات + الكود + الخطة.
> - **الـ TODO الجاري:** `documents/tasks/CLIENT-PAGE-FULLSITE-TODO.md` (checklist تشغيلي).
>
> **SPEC BUILD:** 15 · **Last Updated:** 2026-06-08
> رقم SPEC BUILD يُرفَع مع كل تعديل (نفس رقم الـ HTML التوأم) — للمزامنة (sync). انظر «سجل الإصدارات» في الأسفل.

---

## 0. كيف تستخدم هذا الملف

1. لا تكتب أي كود قبل ما تقرأ القسم المعني هنا.
2. السكيما تُبنى **أول** (القسم ٥) في تمريرة واحدة، لأن فورم الكونسول وعرض مودونتي الاثنين يعتمدان عليها.
3. كل ميزة = **دائرة كاملة** (القسم ٧): schema ← console form ← modonty display + JSON-LD ← live test. لا تُعتبر «منجزة» إلا بعد إغلاق الدائرة على ديسكتوب + موبايل.
4. أي اختلاف بين الموكب والبناء = خرق للعقد. راجع «قاعدة الموكب» (القسم ٣).

---

## 1. النطاق (Scope)

### ✅ داخل النطاق — يُبنى عند «ابروف»
**محتوى صفحة العميل جوا فقط:** الهيرو · الخدمات · الإنجازات · المعرض · الفريق · عن الشركة + فيديو + اعتمادات · المقالات · النقاشات · الأسئلة · آراء العملاء · الموقع · التوثيق · الشريط الجانبي (تواصل/ساعات/توثيق/نشرة/شركاء مشابهون) · CTA الحجز · واتساب عائم.

### 🚧 خارج النطاق — لا يُعدَّل إطلاقاً عند البناء
- **النافبار العلوي** + **الفوتر** + **البار السفلي للجوال** = واجهة مودونتي العامة، مشتركة في كل الموقع.
- الموكب يعرضها مبسّطة كـ placeholder فقط. أي تحسين عليها = **بند منصة منفصل**، يُسجَّل لحاله.
- الـ breadcrumb يتولّاه الموقع الرئيسي، مش هذي الصفحة.

> القاعدة في الذاكرة: `feedback_mockup_is_the_contract` (حدّ النطاق).

---

## 🗺️ أين يحصل التعديل (A→Z عبر التطبيقات)

| التطبيق | إيش يتعدّل فيه | الحجم |
|---|---|---|
| **dataLayer** (السكيما) | الـ ١٠ بنود — مرة واحدة | 🟢 صغير |
| **console** (العميل يدخل بياناته) | فورمات: خدمات · فريق · إنجازات · اعتمادات · فيديو · رفع المعرض · رد الأسئلة + **إعادة توليد SEO عند الحفظ** | 🔴 الأكبر (إدخال) |
| **admin** (مودونتي توثّق) | **فقط** رفع صورة التوثيق: `verificationImageUrl` (Cloudinary) | 🟢 صغير جداً |
| **modonty** (العرض العام) | عرض كل الأقسام على `/clients/[slug]` + JSON-LD | 🔴 الأكبر (عرض) |

> العميل يدخل بياناته من **الكونسول** (مش الأدمن) · الأدمن **فقط** يوثّق · المراجعات والأسئلة يشرف عليها العميل من الكونسول (موجود أصلاً).

---

## ✅ خطة العمل الكاملة (TODO)

نشطّب كل بند ✅ أول ما نخلصه. كل ميزة = دائرة كاملة: سكيما → كونسول/أدمن → عرض مودونتي + JSON-LD → اختبار حيّ.

**✅ الخطوة 0 — السكيما (dataLayer · مرة واحدة) — مكتملة (BUILD 9):**
- ✅ composite types: ClientServiceItem · ClientTeamMember · ClientAchievement · ClientCredential
- ✅ حقول Client: services[] · teamMembers[] · achievements[] · credentials[] · introVideoUrl · verificationImageUrl · clientFaqs
- ⚠️ ClientComment.rating (Int?) — **يُلغى** (قرار BUILD 10: المراجعات صارت موديل مستقل ClientReview)
- ✅ MediaType += GALLERY
- ✅ موديل ClientFAQ جديد
- ✅ طقس Prisma: prisma validate ✓ + prisma generate ✓ (صفر سيرفرات dev شغّالة → ما احتجنا إيقاف node · db push للـ indexes مؤجَّل لـ DB الصح)
- ✅ tsc ×3 (admin · modonty · console) = صفر (exit 0 للثلاثة)

**Phase 1 — الأقسام الأساسية:**
- **١) المراجعات (موديل مستقل `ClientReview`):** ✅ سكيما: ClientReview أُضيف + rating اتشال + علاقتا Client/User · validate+generate ✓ · ▢ مودونتي: فورم تقييم (نجوم+نص، مرة وحدة) + عرض testimonials + stat تقييم + رابط Google · ✅ كونسول: إشراف (موافقة/رفض/حذف/استعادة + بحث/فلاتر + nav + شارة) · tsc ✓ · ✅ JSON-LD: AggregateRating+Review[] (مولّد dataLayer + مستدعيا admin/console + hook إعادة توليد عند الإشراف · شكل مؤكَّد من Google) · tsc×3 ✓ · ▢ مودونتي (مؤجّل للبناء البصري): فورم+عرض+رابط Google · ▢ اختبار
- **٢) التوثيق (verificationImageUrl):** ✅ أدمن: رفع صورة Cloudinary (مودال + كرت في فورم العميل + أكشن) · tsc ✓ · ✅ JSON-LD: Organization.identifier (موجود من CR/vatID/legalName — لا تغيير) · ▢ مودونتي: نافذة التوثيق + الصورة (مؤجّل للبناء البصري) · ▢ اختبار
- **٣) الخدمات (services[]):** ✅ كونسول محرّر قائمة (صفحة «محتوى صفحتك») · ✅ JSON-LD OfferCatalog (tsc×3 ✓) · ▢ مودونتي عرض (مؤجّل بصري) · ▢ اختبار
- **٤) الإنجازات (achievements[]):** ✅ كونسول فورم (صفحة «محتوى صفحتك») · ▢ مودونتي عرض (بلا JSON-LD · مؤجّل بصري) · ▢ اختبار
- **٥) المعرض (GALLERY):** ✅ كونسول رفع Cloudinary (صفحة «معرض الصور» + nav · متعدد + alt + حذف · Media type=GALLERY) · ✅ JSON-LD `Organization.image` ImageObject[] (مولّد + مستدعيا admin/console · tsc ✓) · ▢ مودونتي شبكة (مؤجّل بصري) · ▢ اختبار

**Phase 2 — الأقسام الغنية:**
- **٦) الفريق (teamMembers[]):** ✅ كونسول فورم (صفحة «محتوى صفحتك») · ✅ JSON-LD employee Person[] (tsc×3 ✓) · ▢ مودونتي بطاقات (مؤجّل بصري) · ▢ اختبار
- **٧) الاعتمادات (credentials[]):** ✅ كونسول فورم (صفحة «محتوى صفحتك») · ✅ JSON-LD hasCredential (tsc×3 ✓) · ▢ مودونتي عرض (مؤجّل بصري) · ▢ اختبار
- **٨) فيديو التعريف (introVideoUrl):** ✅ كونسول حقل (صفحة «محتوى صفحتك») · ⚠️ JSON-LD VideoObject مؤجَّل (يحتاج thumbnail+uploadDate+description لتفادي تحذير Google) · ▢ مودونتي مشغّل lazy (مؤجّل بصري) · ▢ اختبار
- **٩) الأسئلة (ClientFAQ):** ✅ كونسول إدارة كاملة (صفحة «أسئلة صفحتك» + nav + شارة · إضافة/تعديل/رد→نشر/رفض/استرجاع/حذف · tsc ✓) · ✅ مودونتي أكشن استقبال سؤال الزائر (`submitClientPageQuestion` · auth + anti-spam + Telegram) + read helper (tsc ✓) · ▢ مودونتي accordion + فورم + ربط FAQPage بـ ClientFAQ (مؤجّل بصري — الصفحة حالياً تعرض FAQ المقالات) · ▢ اختبار

**الإغلاق:**
- ▢ ربط إعادة توليد SEO عند حفظ الكونسول (الإصلاح المعروف)
- ▢ تبويب «بروفايل النشاط» في الكونسول (تجميع الإدخال)
- ▢ اختبار حيّ شامل: ديسكتوب + موبايل · ٣ حالات (قوي/فقير/قيد التجهيز) · RTL · صفر console errors
- ▢ بناء + tsc ×3 صفر قبل أي push

---

## 2. القرار المعماري المقفول

**المبدأ: نقسّم حسب شكل البيانات، مش حسب حجم الجدول. ونحن على MongoDB (مُستندي)، مش SQL.**

| نوع البيانات | القرار | السبب |
|---|---|---|
| قوائم مهيكَلة تُقرأ مع الصفحة وحجمها محدود (خدمات/فريق/إنجازات/اعتمادات) | **composite type مضمّن على Client** | «البيانات اللي تُقرأ مع بعض تُخزَّن مع بعض» — صفر join، أداء كامل، type-safe |
| قوائم لها دورة حياة مستقلة (إشراف/حالة/مصدر) — الأسئلة | **موديل مستقل + relation** | تحتاج status + source + استعلام/ترقيم مستقل؛ والـ composite type أصلاً ما يقبل `@relation` |
| المراجعات (نجوم + نص) | **موديل مستقل `ClientReview`** | أفضل ممارسة (Amazon/Google يفصلون) · نجوم إجبارية + مراجعة واحدة لكل زائر (`@@unique`) · يغذّي `AggregateRating` بنقاء |
| حقول مفردة ١:١ (verificationImageUrl/introVideoUrl) | **حقول مباشرة على Client** | ١:١ يُقرأ مع العميل دايماً |

**قرارات مرفوضة (مع السبب):**
- ❌ **جدول/collection منفصل ١:١ للبروفايل** → على مونغو = استعلام ثانٍ على أسخن قراءة (يضرب أداء مودونتي #1) + مزامنة + خطر orphan + يخالف القاعدة الرسمية. التجميع «بروفايل مستقل» يصير في **فورم الكونسول (UI)**، مش في الـ DB.
- ❌ **wrapper اسمه `businessProfile`** → نص حقول البروفايل (legalName/slogan/vatID/foundingDate) موجودة flat أصلاً؛ لفّ الجديد فقط = تشطير غير متّسق، ولفّ القديم = migration على بيانات إنتاج + لمس كود شغّال. **نكمّل flat.**
- ❌ **`Json` الخام للقوائم** → الشكل معروف، فالصح **composite type** (مُهيكَل + type-safe). `Json` فقط للبيانات غير المتوقّعة الشكل.

> المصادر: prisma.io/docs (composite types / relations) · MongoDB Manual — data-modeling best practices (تمّ التحقّق عبر Context7 بتاريخ 2026-06-08).

---

## 3. الموكب = العقد البصري

الموكب يتبع الـ **System Design الموجود** (`globals.css` · `components/ui` · `modonty-uiux`) — نستخدم الموجود **كما هو**، ما نخترع ولا نطوّع. لو ظهر عنصر في الموكب ما له مقابل جاهز → **نوقف ونسأل**.

---

## 4. موجود أصلاً — لا يُعاد بناؤه

~٨٠٪ من الموكب مغطّى بالسكيما الحالية. الموجود (لا تبنيه من جديد): الهوية (اسم/شعار/كوفر/تاغلاين/تصنيف/موقع/تأسيس) · السوشال (`sameAs`) · الإحصائيات (مقال/مشاهدة/متابع) · CTA الحجز (`ctaMode` + `BookingRequest`) · التواصل + ساعات العمل · الموقع (`addressLatitude/Longitude` + `gbp*`) · المراجعات والنقاشات (`ClientComment`) · المقالات + عدّاداتها + `audioUrl`/`citations` · المعرض (أساس `Media`) · الوصف (`description`) · بيانات التوثيق الرسمية · `subscriptionTier` · JSON-LD المكاش.

---

## 5. الناقص — ❌ ١٠ بنود (كلها إضافية = صفر migration)

> **الملف:** `dataLayer/prisma/schema/schema.prisma` (ملف واحد يضم كل الموديلات).
> **مونغو schemaless** → إضافة composite type / حقل / موديل / قيمة enum = آمنة، صفر migration.

### 5.1 — أربعة composite types (تُعرَّف في أعلى الملف، مستوى `type`، MongoDB-only)

```prisma
/// Embedded service offering — «الخدمات» على صفحة العميل.
type ClientServiceItem {
  title       String
  description String?
  icon        String? // optional icon key / emoji
}

/// Embedded team member — «فريق العمل».
type ClientTeamMember {
  name     String
  role     String?
  bio      String?
  photoUrl String? // Cloudinary URL — composite types can't hold @relation
}

/// Embedded achievement stat — «إنجازاتنا بالأرقام». Free-form per industry.
type ClientAchievement {
  value String  // e.g. "+500"
  label String  // e.g. "عميل سعيد"
  icon  String?
}

/// Embedded credential / certification — «عن الشركة».
type ClientCredential {
  name      String
  authority String? // issuing body
  year      String?
  url       String? // verification / proof link
}
```

> قيود composite type (تمّ التحقّق رسمياً): يدعم `@default`/`@map`/native types، و**لا يدعم** `@id`/`@unique`/`@relation`/`@updatedAt`. لهذا الأسئلة موديل مستقل (تحتاج relation+index).

### 5.2 — حقول جديدة على `model Client` (داخل الموديل)

```prisma
  // ============ Client-page presentation (embedded, read-with-page) ============
  services      ClientServiceItem[]
  teamMembers   ClientTeamMember[]
  achievements  ClientAchievement[]
  credentials   ClientCredential[]
  introVideoUrl String?              // «عن الشركة» intro video URL (YouTube/Vimeo/MP4)

  // ============ Verification («التوثيق») — Modonty-controlled ============
  verificationImageUrl String?       // صورة التوثيق (سجل/ترخيص) — Cloudinary، تُعرَض في الصفحة

  // ============ Client-page FAQ relation ============
  clientFaqs    ClientFAQ[]
```

### 5.3 — موديل جديد `ClientReview` (مستقل — مراجعات خدمة العميل)

```prisma
model ClientReview {
  id       String @id @default(auto()) @map("_id") @db.ObjectId
  clientId String @db.ObjectId
  client   Client @relation(fields: [clientId], references: [id], onDelete: Cascade, onUpdate: NoAction)
  authorId String @db.ObjectId
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)

  rating   Int            // 1–5 (إجباري)
  comment  String         // نص المراجعة
  status   CommentStatus @default(PENDING) // enum موجود: PENDING/APPROVED/REJECTED/DELETED

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([clientId, authorId]) // مراجعة واحدة لكل زائر لكل عميل
  @@index([clientId, status])
  @@map("client_reviews")
}
```
> + على `model Client`: `reviews ClientReview[]` · على `model User`: `clientReviews ClientReview[]`.

> **ليش موديل مستقل (مش `ClientComment` + rating) — قرار BUILD 10:**
> - المواقع الكبيرة تفصل التقييم عن النقاش (Amazon / Google / Trustpilot / Yelp).
> - نجوم **إجبارية** + **مراجعة واحدة لكل زائر** (`@@unique`) — مستحيل على comment (متعدّد).
> - يغذّي `AggregateRating` بنقاء — ما يختلط بتعليقات بلا نجوم.
> - الزائر يقيّم **خدمة العميل** — مش المقالات. ممنوع العميل يقيّم نفسه (`authorId != client.userId`).
> - `ClientComment` يبقى للنقاش فقط — **خارج نطاق الموكب الحالي**.

### 5.4 — تعديل `enum MediaType` (إضافة قيمة)

```prisma
enum MediaType {
  LOGO
  POST
  OGIMAGE
  TWITTER_IMAGE
  HERO
  GALLERY   // ← جديد: صورة معرض أعمال العميل «معرض الأعمال»
  GENERAL
}
```

> صور المعرض = `Media` بـ `type=GALLERY` + `scope=CLIENT` + `clientId`. لا موديل جديد.

### 5.5 — موديل جديد `ClientFAQ` (نسخة مطابقة لـ `ArticleFAQ`)

```prisma
model ClientFAQ {
  id       String @id @default(auto()) @map("_id") @db.ObjectId
  clientId String @db.ObjectId
  client   Client @relation(fields: [clientId], references: [id], onDelete: Cascade, onUpdate: NoAction)

  question String
  answer   String?          // اختياري لحين رد العميل (reader submissions)
  position Int              // ترتيب السؤال
  status   ArticleFAQStatus @default(PENDING) // إعادة استخدام enum موجود: PENDING/PUBLISHED/REJECTED

  submittedByName  String?  // للأسئلة الواردة من الزائر
  submittedByEmail String?
  source           String?  @default("manual") // "manual" | "chatbot" | "user"

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clientId, position])
  @@index([clientId, status])
  @@map("client_faqs")
}
```

### ملخّص الـ ١٠ بنود
| # | البند | النوع |
|---|---|---|
| 1–4 | `ClientServiceItem` · `ClientTeamMember` · `ClientAchievement` · `ClientCredential` | composite types |
| 5 | `services/teamMembers/achievements/credentials` arrays + `introVideoUrl` | حقول على Client |
| 6 | `verificationImageUrl` (صورة Cloudinary) | حقل على Client |
| 7 | `clientFaqs` relation | حقل على Client |
| 8 | `model ClientReview` (+ علاقتا Client/User) | موديل جديد |
| 9 | `MediaType += GALLERY` | قيمة enum |
| 10 | `model ClientFAQ` | موديل جديد |

---

## 6. خريطة كل قسم: الموكب ↔ البيانات ↔ JSON-LD ↔ مالك الإدخال

| قسم الموكب | مصدر البيانات | JSON-LD (schema.org) | مالك الإدخال |
|---|---|---|---|
| الهيرو / الهوية | name·logo·hero·slogan·industry·address·foundingDate | `Organization` / `LocalBusiness` (name, logo, url, sameAs, address, foundingDate, telephone, email) | كونسول |
| التوثيق | legalName·CR·vatID·taxID (موجود) + `verificationImageUrl` (صورة) | `Organization.identifier` + `legalName` | البيانات: كونسول · **صورة التوثيق: أدمن** |
| الخدمات | `services[]` | `Service` / `OfferCatalog` (`hasOfferCatalog`) | كونسول |
| الإنجازات | `achievements[]` | — (تسويقي، لا نوع رسمي → عرض فقط، بلا JSON-LD مُختلَق) | كونسول |
| آراء العملاء | `ClientReview` (APPROVED) | `AggregateRating` + `Review[]` | الزائر (نجوم+نص) · إشراف: كونسول |
| المعرض | `Media` (type=GALLERY) | `ImageObject[]` | كونسول (رفع) |
| الفريق | `teamMembers[]` | `Organization.employee: Person[]` | كونسول |
| عن الشركة + فيديو | `description` + `introVideoUrl` | `Organization.description` + `VideoObject` | كونسول |
| الاعتمادات | `credentials[]` | `hasCredential: EducationalOccupationalCredential[]` | كونسول |
| المقالات | `Article` + counts + audioUrl + citations | `Article` + `BreadcrumbList` (يتولّاها الموقع الرئيسي) | يُولّد آلياً |
| النقاشات (خارج النطاق) | `ClientComment` (يبقى للأرشيف — مش في الموكب) | — | — |
| الأسئلة | `ClientFAQ` (PUBLISHED) | `FAQPage` | الأسئلة: زائر/شات بوت · الأجوبة: كونسول |
| الموقع | addressLatitude/Longitude + gbp* | `GeoCoordinates` + address داخل LocalBusiness | كونسول |
| ساعات العمل | `openingHoursSpecification` | `OpeningHoursSpecification` | كونسول |
| stat «تقييم» | `AVG(ClientReview.rating)` (APPROVED) | `AggregateRating` | محسوب |

> **قاعدة الملكية:** بيانات بروفايل العميل تُدخَل من **الكونسول** (`updateProfile`) — فورم الأدمن تُركت بدونها عمداً (`project_client_field_ownership`). **الاستثناء:** صورة التوثيق (`verificationImageUrl`) = أدمن (مودونتي توثّق؛ العميل ما يوثّق نفسه — مرساة الثقة «مش نصب»).

---

## 7. خطة البناء — الدائرة الكاملة لكل ميزة

> لكل ميزة: **schema ← console form ← modonty display + JSON-LD ← live test (ديسكتوب + موبايل، RTL، صفر console errors)**. لا «منجزة» قبل إغلاق الدائرة بالكامل.
> الموكب يُبنى **ديسكتوب + موبايل في تمريرة responsive واحدة** (الكود responsive — ممنوع نبني ديسكتوب ثم موبايل منفصلين).

### الخطوة 0 — السكيما (تمريرة واحدة، كل الـ ١٠ بنود)
طقس Prisma الإلزامي عند أي تعديل سكيما:
```
1. taskkill /F /IM node.exe        # أوقف كل السيرفرات (Turbopack يمسك file handles)
2. pnpm prisma:generate            # (أو عبر الـ filter المناسب)
3. أعد تشغيل سيرفرات dev بعد اكتمال generate
```
verify: `pnpm tsc --noEmit` على الثلاثة (modonty/admin/console) = صفر.

### Phase 1 — الأقسام الأساسية
1. **آراء العملاء (`ClientReview`)** — موديل مستقل. سكيما ClientReview + فورم تقييم (نجوم+نص، مرة وحدة) على مودونتي + عرض testimonials + `AggregateRating` JSON-LD + stat «تقييم» + إشراف الكونسول.
2. **التوثيق (صورة Cloudinary)** — الأدمن يرفع `verificationImageUrl` + تُعرَض في نافذة التوثيق + `Organization.identifier` JSON-LD.
3. **الخدمات (services[])** — فورم كونسول (محرّر قائمة) + عرض + `OfferCatalog` JSON-LD.
4. **الإنجازات (achievements[])** — فورم كونسول + عرض (بلا JSON-LD).
5. **المعرض (GALLERY)** — رفع كونسول (Cloudinary، type=GALLERY) + عرض شبكي + `ImageObject[]` JSON-LD.

### Phase 2 — الأقسام الغنية
6. **الفريق (teamMembers[])** — فورم كونسول + عرض بطاقات + `employee: Person[]` JSON-LD.
7. **الاعتمادات (credentials[])** — فورم كونسول + عرض + `hasCredential` JSON-LD.
8. **فيديو التعريف (introVideoUrl)** — حقل كونسول + مشغّل lazy + `VideoObject` JSON-LD.
9. **الأسئلة (ClientFAQ)** — فورم كونسول (أجوبة) + استقبال أسئلة الزائر (source=user) + عرض accordion + `FAQPage` JSON-LD.

### الخطوة الأخيرة — تجميع البروفايل في الكونسول
تبويب/قسم «بروفايل النشاط» في الكونسول يجمع كل الحقول أعلاه ككتلة واحدة منظّمة (التجميع UI، مش DB).

---

## 8. JSON-LD — قواعد إلزامية

- **JSON-LD مسؤولية الكود، مش الأدمن** (`project_jsonld_is_code_responsibility`) — يُولَّد آلياً من المولّد، لا يكتبه أحد يدوياً.
- يُضاف لكل قسم جديد ضمن **مولّد SEO للعميل الموجود** (`generateClientSEO`)، ويُكاش في `Client.jsonLdStructuredData`.
- 🔴 **مشكلة معروفة لازم تُحل في هذا البناء:** `updateProfile` بالكونسول **ما يستدعي `generateClientSEO`** → الكاش يبقى قديم بعد تعديل العميل (`project_console_must_regenerate_seo`). بما إننا نضيف حقولاً يُدخلها الكونسول وتغذّي JSON-LD، **لازم نربط إعادة التوليد في حفظ الكونسول** ضمن هذا العمل.
- الأرقام التسويقية (achievements) **بلا نوع schema.org** → عرض فقط، ممنوع نختلق نوعاً.

---

## 9. قواعد وطقوس إلزامية

- **الأداء أولوية #1 على مودونتي:** صفحة العميل = visitor page → Server Components للهيكل · `dynamic()` للأجزاء التفاعلية · `<Suspense>` للبيانات البطيئة · **lazy-load للخريطة** · `next/image` بـ priority للصور فوق الطية فقط.
- **RTL:** `ps/pe/ms/me/start/end` فقط، ممنوع `pl/pr/left/right`. أيقونات الاتجاه `rtl:rotate-180`.
- **shadcn/ui أول** — لا تبني من الصفر لو فيه مكوّن جاهز.
- **ممنوع أرقام وهمية** (`feedback_no_fake_numbers_in_pitch`) — إنجازات/نتائج = بيانات حقيقية مُتحقَّقة فقط، تُخفى لو غير موجودة.
- **Prisma:** `select` للحقول المحددة (لا `include` أعمى) · `take` دايماً للقوائم.
- **بعد كل mutation:** `revalidatePath`/`revalidateTag`.
- **Zod** لكل input في الكونسول + `auth()` لكل server action.
- **الدائرة الكاملة:** أي تغيير على مودونتي يُتتبّع عبر الثلاثة (modonty ↔ admin ↔ console)، الثلاثة صح ١٠٠٪ (`feedback_full_circle_verification`).

---

## 10. حالات الصفحة الثلاث (في الموكب)

| الحالة | المعالجة |
|---|---|
| **عميل قوي** (بيانات كاملة) | كل الأقسام تظهر |
| **عميل فقير** (بيانات شحيحة) | أقسام أساسية تظهر دايماً · الاختيارية تُخفى لو فاضية (hide-if-empty) — لا أقسام فاضية محرجة |
| **قيد التجهيز** (مفعّل لكن الصفحة مش جاهزة) | لوحة «قيد التجهيز» + **`noindex` (وقت البناء، مش الموكب)** |

> القاعدة: الأقسام الأساسية (هوية/تواصل/توثيق) دايماً. القوائم الاختيارية (خدمات/فريق/إنجازات/اعتمادات/معرض/أسئلة) تُخفى عند الفراغ.

---

## 11. نافذة التوثيق — مواصفة دقيقة

- تُفتح من «عرض التوثيق ›» (الموكب: `#verifyModal` عبر CSS `:target`).
- **محتوى البيانات الرسمية (من حقول موجودة):** `legalName` · `commercialRegistrationNumber` · الجهة = «وزارة التجارة» (ثابت) · `vatID` · المقر (address*) · `foundingDate`.
- **صورة التوثيق:** `verificationImageUrl` — صورة (سجل تجاري/ترخيص/شهادة) من Cloudinary، يرفعها الأدمن وتُعرَض للزائر في الصفحة.
- **لا «معروف»:** منصة سعودية فقط؛ مودونتي تخدم مصر وغيرها، فالتوثيق = الصورة (تشتغل لأي بلد). علامة «موثّق» الزرقاء لمدوّنتي تبقى منفصلة.

---

## 12. معايير القبول (لكل ميزة — checklist)

```
□ schema: الحقل/الموديل مُضاف + prisma generate نجح + tsc ×3 صفر
□ console: فورم الإدخال (Zod + auth) يحفظ + revalidate + يستدعي generateClientSEO
□ modonty: العرض يطابق الموكب ١٠٠٪ (عرض/مكوّن/حواف/ألوان/خط)
□ JSON-LD: النوع الصحيح يُولَّد + يُكاش + يُتحقَّق منه (لا تحذير)
□ أداء: Server Component + lazy للثقيل + صفر JS زائد فوق الطية
□ live test: ديسكتوب + موبايل · RTL سليم · لا overflow · صفر console errors
□ الحالات: عميل قوي يعرض · عميل فقير يُخفي الفاضي · قيد التجهيز noindex
□ الدائرة الكاملة: modonty ↔ admin ↔ console الثلاثة صح
```

---

## 13. الملفات المرجعية

| الغرض | المسار |
|---|---|
| العقد البصري (الموكب) | `documents/tasks/client-page-light-mockup.html` (BUILD 15) |
| السكيما | `dataLayer/prisma/schema/schema.prisma` (Client@301 · ClientComment@1476 · MediaType@62 · ArticleFAQ@1239 كقالب) |
| الصفحة الحالية | `modonty/app/clients/[slug]/page.tsx` + `components/hero/client-hero.tsx` + `helpers/client-engagement.ts` + `helpers/client-faqs.ts` |
| design tokens | `modonty/app/globals.css` |
| الـ TODO الجاري | `documents/tasks/CLIENT-PAGE-FULLSITE-TODO.md` |
| عملاء التست | demo-normal / demo-ymyl / جبر-سيو (modonty_dev) — انظر الذاكرة |

---

## ⟳ سجل الإصدارات (Version Control)

رقم **SPEC BUILD** يُرفَع مع كل تعديل على هذا المرجع (نفس الرقم في الـ HTML التوأم) — للمزامنة. خالد يتأكّد إنه يشوف آخر رقم (Ctrl+Shift+R على الـ HTML).

| BUILD | التاريخ | التغيير |
|---|---|---|
| **17** | 2026-06-09 | ✅ **البناء البصري لصفحة مودونتي مكتمل (single-page)** — أُعيد بناء `/clients/[slug]` بالكامل طبق الموكب: هيرو (غلاف+بطاقة متراكبة+موثّق+شارة مميّز+CTA حجز) · شريط تنقّل scroll-spy (يُشتق من الأقسام الظاهرة فعلاً) · شبكة عمودين · كل الأقسام (خدمات/إنجازات/تقييمات/معرض/فريق/عن الشركة+فيديو lazy+اعتمادات+بيانات قانونية/مقالات+actStrip/نقاشات/أسئلة+فورم سؤال/الموقع+خريطة) + سايدبار (تواصل سريع/ساعات+مفتوح الآن/توثيق+مودال/نشرة/شركاء مشابهون) + footer CTA + واتساب عائم + dock جوال + ٣ حالات (قوي/فقير/قيد التجهيز+noindex). بُني عبر workflow (١٦ مكوّن متوازي بواجهات محدّدة) + تجميع يدوي (`client-page-shell.tsx`). التبديل: `page.tsx` (تقييمات→`getClientReviews` · أسئلة→`ClientFAQ` · نقاشات→تعليقات المقالات · FAQPage من ClientFAQ) + `layout.tsx` نُحّف (الهيرو انتقل للـ shell) + `/about`+`/contact` → redirect 308. الجاليري يقرأ GALLERY Media. توكنز دلالية (`--star`/`--success`). **اختبار حيّ (جبر سيو · modonty_dev):** ديسكتوب+جوال · صفر console errors · الثيم الفاتح مطابق للموكب 100% + يتكيّف داكن عبر tokens · scroll-spy + hide-if-empty صحيحان · RTL سليم · أُصلح bug تبويب بلا مرساة. tsc×3 = صفر. **معلّق قبل الـ push: قرار خالد + version bump + changelog + backup.** |
| **16** | 2026-06-08 | ✅ **جهة البيانات مكتملة 100% لكل الـ ٩ ميزات.** المعرض (٥): صفحة كونسول «معرض الصور» (`/dashboard/gallery`) — رفع Cloudinary متعدد + alt + حذف فوري · `Media` type=GALLERY scope=CLIENT · `Organization.image` ImageObject[] في المولّد + select المستدعيَين (admin/console). الأسئلة (٩): صفحة كونسول «أسئلة صفحتك» (`/dashboard/page-faq`) — إدارة ClientFAQ كاملة + شارة عدّاد · مودونتي `submitClientPageQuestion` (auth + anti-spam ٥ + Telegram) + read helper `getClientPageFaqs`. tsc admin/console/modonty = صفر. **متبقٍّ: البناء البصري لصفحة مودونتي (كل العروض + ربط FAQPage بـ ClientFAQ) + الاختبار الحيّ.** |
| **15** | 2026-06-08 | ✅ **JSON-LD للخدمات/الفريق/الاعتمادات:** `hasOfferCatalog` (Offer→Service) · `employee` (Person[]) · `hasCredential` (EducationalOccupationalCredential[]) في المولّد + select المستدعيَين (admin/console) · tsc×3 = صفر. (تحذيرات المُحقِّق تُفحَص في الاختبار الحيّ.) متبقٍّ على جهة البيانات: المعرض (GALLERY) + الأسئلة (FAQPage). |
| **14** | 2026-06-08 | ✅ **إدخال الكونسول للميزات ٣/٤/٦/٧/٨ مبني** (صفحة `/dashboard/page-content` «محتوى صفحتك»: محرّرات خدمات/إنجازات/فريق/اعتمادات + حقل فيديو · أكشن `updatePageContent` بـ Prisma composite `{set}` + regen · nav ديسكتوب/موبايل + breadcrumb) · console tsc = صفر. ⚠️ VideoObject مؤجَّل (يحتاج thumbnail/uploadDate/description لتفادي تحذير Google). متبقٍّ: JSON-LD (OfferCatalog/employee/hasCredential) + كل العرض على مودونتي. |
| **13** | 2026-06-08 | ✅ **الميزة ١ (المراجعات) مكتملة جهة البيانات:** JSON-LD AggregateRating+Review[] (مولّد dataLayer + مستدعيا admin/console + hook إعادة توليد عند موافقة/رفض المراجعة · شكل مؤكَّد من وثائق Google · نموذج المنصة طرف-ثالث مؤهّل). + ✅ **الميزة ٢ (التوثيق):** رفع صورة Cloudinary بالأدمن (مودال + كرت + أكشن `updateClientVerificationImage`) · identifier موجود أصلاً. tsc×3 = صفر. عرض مودونتي للاثنتين مؤجّل للبناء البصري النهائي. |
| **12** | 2026-06-08 | ✅ **بُني إشراف المراجعات بالكونسول** (`/dashboard/client-reviews`: صفحة + جدول بنجوم + موافقة/رفض/حذف/استعادة + بحث/فلاتر + nav ديسكتوب/موبايل + breadcrumb + شارة عدّاد) · console tsc = صفر. **القرار المعتمد للبناء: الخطة أ** (بيانات+JSON-LD لكل الميزات أول، ثم إعادة بناء صفحة مودونتي بصرياً مرة وحدة في النهاية). |
| **11** | 2026-06-08 | ✅ **نُفّذت سكيما المراجعات:** أُضيف `model ClientReview` (+ `reviews` على Client · `clientReviews` على User · `@@unique([clientId,authorId])`) · أُلغي `ClientComment.rating` · validate + generate ✓. |
| **10** | 2026-06-08 | 🔁 **قرار: المراجعات = موديل مستقل `ClientReview`** (مش ClientComment+rating). نجوم+نص · مرة وحدة لكل زائر (`@@unique`) · على صفحة العميل (تقييم خدمة العميل، مش المقالات) · يغذّي `AggregateRating`. سبب: أفضل ممارسة (Amazon/Google يفصلون). أُلغي `ClientComment.rating` من الخطوة 0. |
| **9** | 2026-06-08 | ✅ **الخطوة 0 منفّذة:** السكيما عُدّلت (٤ composite types + ٦ حقول Client + ClientComment.rating + MediaType.GALLERY + موديل ClientFAQ) · prisma validate+generate ✓ · tsc ×3 = صفر. (تصحيح: console updateProfile **يستدعي** regenerateClientSeo فعلاً — يُتحقَّق وقت الإغلاق.) |
| **8** | 2026-06-08 | توسيع TODO لخطة كاملة مفصّلة (كل ميزة بخطوات الدائرة الكاملة: كونسول/أدمن · مودونتي · JSON-LD · اختبار). |
| 7 | 2026-06-08 | التوثيق: حذف «معروف» + verifiedAt → `verificationImageUrl` (صورة Cloudinary، تشتغل لأي بلد — عملاء مصر بلا معروف). + قسم TODO. |
| 6 | 2026-06-08 | إضافة قسم «أين يحصل التعديل» (A→Z): dataLayer · console (الأكبر إدخال) · admin (توثيق فقط) · modonty (الأكبر عرض). |
| 5 | 2026-06-08 | فصل المسؤوليات: HTML = قرارات خالد فقط (شِلت سجل الإصدارات منه) · MD = البناء + السجل. |
| 4 | 2026-06-08 | حذف §13 (خارج النطاق) — مكرّر في §9/§10/§12 ومربك. إعادة ترقيم §14→§13. |
| 3 | 2026-06-08 | تنقية — حذف جدول الـ System Design (§3) وجدول «موجود» (§4)، تحويلهما لسطر. مبدأ: المرجع = قرارات فقط، لا تأكيد لمعلوم. |
| 2 | 2026-06-08 | القسم ٣ — توضيح أن الـ System Design موجود أصلاً (لا اختراع · لا تطويع shadcn بـ variants). أُضيف نظام SPEC BUILD + هذا السجل. |
| 1 | 2026-06-08 | إنشاء المرجع الكامل (١٤ قسم): النطاق · القرار المعماري · مسح السكيما · الناقص ١٠ بنود + كود Prisma · خريطة الأقسام ↔ JSON-LD ↔ الملكية · خطة البناء · معايير القبول. |

---

*هذا الملف يُحدَّث مع كل قرار جديد. أي بناء يخالفه = خطأ يُوقَف ويُراجَع. — SPEC BUILD 17*
