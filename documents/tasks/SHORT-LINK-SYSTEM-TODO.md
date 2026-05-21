# 🔗 Short Link System — Master TODO

**Last Updated:** 2026-05-21 (Phase 0 — planning + structure agreed)
**Status:** 🟡 PLANNING — awaiting final approval before Phase 1
**Owner:** Khalid
**Files to be touched (planned):**
- `dataLayer/prisma/schema/schema.prisma` — new `ShortLink` + `Event` models
- `modonty/app/r/[code]/route.ts` — redirect endpoint (NEW)
- `modonty/lib/short-link/` — slug helper + transliteration (NEW)
- `modonty/components/shared/ShareButtons.tsx` — use short URL
- `admin/app/(dashboard)/short-links/` — admin dashboard (NEW)
- `console/app/(dashboard)/dashboard/share-stats/` — client analytics (NEW)

---

## 🎯 الهدف الجوهري

حل مشكلة **روابط مودونتي العربية اللي ما تفتح في iPhone** + رفع قيمة المنتج للعميل عبر:

١. روابط نظيفة قابلة للقراءة (slug إنجليزي مولّد من العربي تلقائياً)
٢. QR Code تلقائي لكل رابط
٣. لوحة تحليلات في الكونسول — العميل يشوف أداء مشاركاته
٤. تتبّع القناة (واتساب · تويتر · إيميل · تلجرام)
٥. يدعم: مقالات · عملاء · **أحداث (كيان جديد)** · أي رابط مشاركة عربي في النظام

---

## 🧪 المكوّن الجوهري: مُحوّل العربي → إنجليزي

**القاعدة:** بدل ما نولّد أكواد عشوائية، نأخذ النص العربي ونحوّله إلى Latin ASCII slug قابل للقراءة.

**أمثلة مطلوبة:**

| العربي الأصلي | الـ slug الناتج |
|---|---|
| مقال السيو في السعودية | `maqal-al-seo-fi-al-saudia` |
| كيما زون للوجستيات | `kimazone-logistics` |
| مهرجان الرياض ٢٠٢٦ | `mahrajan-al-riyadh-2026` |
| فعالية موسم جدة | `faaliyat-mawsim-jeddah` |

**متطلبات الـ helper function:**
- [ ] **`arabicToLatinSlug(text: string): string`** — يُبنى في `modonty/lib/short-link/transliterate.ts`
- [ ] يزيل التشكيل أولاً (ُ ِ ّ ً ٍ ٌ ْ ُ ـ)
- [ ] يحوّل ٢٨ حرف عربي → equivalent Latin (ج→j, خ→kh, ع→aa, ق→q, إلخ)
- [ ] يحوّل الأرقام العربية ٠-٩ → 0-9
- [ ] يُسقط أحرف الجر الصغيرة (ال, في, من, إلى) لو طول الـ slug تخطّى ٣٠ حرف
- [ ] يستبدل المسافات + الرموز الخاصة بـ `-`
- [ ] lowercase دائماً
- [ ] يقتطع لحدّ أقصى ٥٠ حرف
- [ ] يضيف رقم في حالة تكرار (`maqal-seo` موجود → `maqal-seo-2`)

**مكتبات يمكن الاستفادة منها:**
- `slugify` (npm) — يدعم Arabic transliteration لكن جودة محدودة
- `arabic-transliterate` (npm) — مخصّص للعربية
- **التوصية:** نبني helper بسيط بأنفسنا (٣٠ سطر) — تحكم كامل + لا تبعية خارجية

---

## 📦 الكيانات المدعومة

### ١. Articles (المقالات) — موجود
- [ ] إنشاء رابط قصير عند **نشر المقال** (مش عند المشاركة) — pre-generation
- [ ] الـ slug يُولَّد من `article.title` العربي
- [ ] يُحفظ في `ShortLink.entityType = "article"` + `entityId = article.id`

### ٢. Clients (العملاء) — موجود
- [ ] إنشاء رابط قصير عند **إنشاء العميل**
- [ ] الـ slug يُولَّد من `client.name` العربي
- [ ] `ShortLink.entityType = "client"` + `entityId = client.id`

### ٣. Events (الأحداث) — **كيان جديد كلياً**
- [ ] **بناء Event model** في `schema.prisma`:
  ```
  model Event {
    id          String   @id @default(auto())
    slug        String   @unique
    title       String
    description String?
    startDate   DateTime
    endDate     DateTime?
    location    String?
    city        String?
    country     String?
    organizer   String?
    imageUrl    String?
    clientId    String?  // optional ربط بعميل
    status      EventStatus @default(DRAFT)
    createdAt   DateTime @default(now())
  }
  ```
- [ ] صفحة عرض الحدث في `modonty.com/events/[slug]`
- [ ] إدارة الأحداث في `admin/app/(dashboard)/events/`
- [ ] رابط قصير تلقائي لكل حدث
- [ ] **القيمة:** الأحداث ترفع قيمة المشروع — تخدم العملاء في الإعلان عن مهرجاناتهم، مؤتمراتهم، فعالياتهم

### ٤. Generic Share (أي رابط مشاركة عربي)
- [ ] أي صفحة في النظام تحتوي على زر مشاركة — يجب أن تستخدم النظام
- [ ] يشمل: صفحات الفئات · الوسوم · صفحات الصناعات · الصفحة الرئيسية لو شُورِكت

---

## 📋 المراحل التنفيذية

### Phase 0 — قرارات قبل البدء ✅

- [x] الـ structure متّفق عليه (`modonty.com/r/[slug]`)
- [x] محوّل العربي → إنجليزي بدلاً من الأكواد العشوائية
- [x] دعم Events كنوع جديد
- [x] QR code لكل رابط
- [ ] **قرار-١:** هل نخفي السطر الأزرق العلوي للرابط في رسالة واتساب؟ (نعم: نبعت رسالة مرتّبة بعنوان + رابط منفصل)
- [ ] **قرار-٢:** هل يحق للعميل في الكونسول توليد روابط بنفسه؟ (إجابتي المقترحة: نعم — Self-serve)
- [ ] **قرار-٣:** إيش يحدث للرابط لو المقال أُلغي/حُذف؟ (مقترح: ٤٠٤ مهذّبة + زر "الرئيسية")

---

### Phase 1 — الأساس التقني (~يوم واحد)

#### قاعدة البيانات
- [ ] **١.١** إضافة `ShortLink` model في `dataLayer/prisma/schema/schema.prisma`:
  ```
  model ShortLink {
    id           String   @id @default(auto())
    code         String   @unique
    targetPath   String   // "/articles/مقال-السيو"
    entityType   String   // "article" | "client" | "event" | "page"
    entityId     String?
    clientId     String?  // ownership للتحليلات في الكونسول
    clicks       Int      @default(0)
    lastClickAt  DateTime?
    createdBy    String?  // userId
    createdAt    DateTime @default(now())
    updatedAt    DateTime @updatedAt
    isActive     Boolean  @default(true)
    qrCodeUrl    String?  // PNG مُولَّد ومحفوظ في Cloudinary
  }
  ```
- [ ] **١.٢** إضافة `Event` model (انظر تفاصيلها فوق)
- [ ] **١.٣** Migration script لتوليد روابط قصيرة للمقالات + العملاء الموجودين حالياً

#### المُحوّل العربي
- [ ] **١.٤** إنشاء `modonty/lib/short-link/transliterate.ts` — جدول الـ ٢٨ حرف + الأرقام
- [ ] **١.٥** إنشاء `modonty/lib/short-link/slug-generator.ts` — orchestrator (يأخذ نص → ينظّف → يحوّل → يفحص التكرار → يرجع slug جاهز)
- [ ] **١.٦** Unit tests للحالات الحرجة:
  - نص بتشكيل كثيف
  - نص بأرقام عربية
  - نص بعلامات ترقيم
  - نص بإنجليزي مخلوط
  - نص قصير جداً (٣ أحرف)
  - نص طويل جداً (٢٠٠+ حرف)
  - حروف نادرة (ﭐ ﭑ ﭒ — Presentation Forms)

#### مسار التحويل
- [ ] **١.٧** بناء `modonty/app/r/[code]/route.ts` — server route:
  - يستقبل الـ slug
  - يبحث في `ShortLink` table (cached)
  - لو موجود + نشط → يزيد `clicks` + يحوّل ٣٠١
  - لو غير موجود → ٤٠٤ مهذّبة
  - يكتشف القناة من User-Agent + Referrer
  - يضيف UTM tags تلقائياً للرابط النهائي

---

### Phase 2 — التوليد المسبق (~نصف يوم)

- [ ] **٢.١** Hook في `publishArticle` action — يولّد رابط قصير عند النشر
- [ ] **٢.٢** Hook في `createClient` action — يولّد رابط قصير عند إنشاء العميل
- [ ] **٢.٣** Hook في `createEvent` action (لما نبني Events) — رابط قصير تلقائي
- [ ] **٢.٤** Cache strategy: الروابط القصيرة دائمة (immutable) — cache بـ `unstable_cache` لـ ٢٤ ساعة + tag للإلغاء

---

### Phase 3 — QR Code (~نصف يوم)

- [ ] **٣.١** تثبيت `qrcode` npm package (مُنخفض الحجم ~٤٠KB)
- [ ] **٣.٢** عند توليد رابط قصير → توليد QR PNG (٥١٢×٥١٢) + رفعه لـ Cloudinary
- [ ] **٣.٣** حفظ الـ URL في `ShortLink.qrCodeUrl`
- [ ] **٣.٤** زر "تحميل QR Code" في:
  - زر المشاركة في modonty (للمقال + العميل + الحدث)
  - لوحة الكونسول (للعميل)
  - لوحة الأدمن (لإدارة كل الروابط)

---

### Phase 4 — ربط زر المشاركة (~نصف يوم)

- [ ] **٤.١** تعديل `modonty/components/shared/ShareButtons.tsx`:
  - يأخذ `shortUrl` كـ prop
  - يستخدم الرابط القصير في كل القنوات (واتساب · تويتر · لينكدإن · إيميل · نسخ)
  - حذف منطق `decodeURIComponent(window.location.href)` القديم
- [ ] **٤.٢** كل صفحة فيها مشاركة تجلب `shortUrl` من قاعدة البيانات + تمرّره
- [ ] **٤.٣** Fallback: لو ما في رابط قصير، استخدم encoded URL (آمن)
- [ ] **٤.٤** اختبار حي من iPhone حقيقي على ٥ مقالات + ٣ عملاء

---

### Phase 5 — تتبّع القناة الذكي (~نصف يوم)

- [ ] **٥.١** عند فتح الرابط القصير، اكتشاف القناة من:
  - User-Agent (`WhatsApp` · `Twitter` · `Telegram` · `FB_IAB`)
  - Referrer (`twitter.com` · `linkedin.com` · `facebook.com`)
- [ ] **٥.٢** إضافة UTM tags تلقائياً قبل التحويل:
  - `?utm_source=whatsapp&utm_medium=share&utm_campaign=short-link`
- [ ] **٥.٣** تكامل مع GA4 عبر `console/lib/ga4/` — كل ضغطة = حدث `short_link_click` بـ source label
- [ ] **٥.٤** عدّاد منفصل لكل قناة في `ShortLink` (clicksWhatsApp · clicksTwitter · إلخ)

---

### Phase 6 — لوحة تحكم الأدمن (~نصف يوم)

- [ ] **٦.١** بناء `admin/app/(dashboard)/short-links/page.tsx`:
  - جدول كامل: الكود · الكيان · العميل · الضغطات · القنوات · تاريخ الإنشاء · حالة
  - فلترة بالعميل + الكيان + التاريخ
  - بحث في الـ slug
- [ ] **٦.٢** صفحة تفاصيل `/short-links/[code]`:
  - رسم بياني للضغطات على ٣٠ يوم
  - توزيع القنوات (دائري)
  - أعلى ٢٠ زائر (سرعة قراءة معلومة وافية إذا تستحق)
  - زر إلغاء/تنشيط
- [ ] **٦.٣** Bulk actions: إلغاء × توليد QR جديد × تصدير CSV

---

### Phase 7 — لوحة الكونسول للعميل (الميزة الأقوى — ~يوم واحد) ⭐

**القيمة المضافة:** هذه الميزة وحدها تستحق المشروع كله. العميل يشوف أداء مشاركاته بنفسه — يكسر مخاوف "أنا أدفع وما أدري إيش يصير".

- [ ] **٧.١** بناء `console/app/(dashboard)/dashboard/share-stats/page.tsx`:
  - بطاقات KPI: إجمالي الضغطات · القناة الأقوى · أعلى مقال · أعلى يوم
  - رسم خطّي ٣٠ يوم
  - جدول أعلى ١٠ مقالات حسب الضغطات
  - جدول أعلى ١٠ روابط عملاء (لو العميل عنده ملف شخصي)
- [ ] **٧.٢** Self-serve generation:
  - زر "ولّد رابط مشاركة" في كل مقال + ملف العميل
  - زر "حمّل QR Code"
  - زر "نسخ رابط واتساب جاهز" (مع رسالة مقترحة)
- [ ] **٧.٣** صفحة "تخصيص رابط" (متقدمة — اختياري):
  - العميل يقترح slug مقروء (مثل `ramadan-2026`)
  - يخضع لموافقة الأدمن في الحملات الكبيرة

---

### Phase 8 — صفحات الأحداث (Events) — ~يومين 🎉

- [ ] **٨.١** بناء `Event` model + Migration
- [ ] **٨.٢** صفحة عرض الحدث `modonty/app/events/[slug]/page.tsx` (SSR + JSON-LD Event schema)
- [ ] **٨.٣** صفحة الأحداث الرئيسية `modonty/app/events/page.tsx` (listing + filters)
- [ ] **٨.٤** إدارة الأحداث في `admin/app/(dashboard)/events/`:
  - CRUD كامل
  - رفع صورة الحدث
  - ربط بعميل (اختياري)
  - حالات (DRAFT · PUBLISHED · ENDED · CANCELLED)
- [ ] **٨.٥** ربط الحدث بالعميل في صفحة العميل (`/clients/[slug]` تعرض أحداث العميل القادمة)
- [ ] **٨.٦** OG image تلقائي + Twitter Card
- [ ] **٨.٧** Sitemap entry للأحداث
- [ ] **٨.٨** اختبار حي على ٣ أحداث تجريبية

---

### Phase 9 — تنظيف وتوثيق (~ساعتين)

- [ ] **٩.١** حذف أي كود قديم لـ `ShareButtons.tsx` (encode/decode dance)
- [ ] **٩.٢** Documentation في `documents/guides/short-link-system.md`:
  - كيف تستخدم
  - كيف تعدّل المُحوّل العربي
  - كيف تضيف كيان جديد
- [ ] **٩.٣** Backup سياسة (الـ ShortLink أحد أهم الجداول الآن)
- [ ] **٩.٤** Live test كامل end-to-end على ١٠ سيناريوهات

---

## 🚀 تحسينات مستقبلية (Phase 10+)

- [ ] **١٠.١** نطاق قصير منفصل (`mdn.ty/[slug]`) — حسب طلب لاحق
- [ ] **١٠.٢** صلاحية محدودة للروابط (تنتهي بعد X يوم — مفيد للحملات)
- [ ] **١٠.٣** A/B testing — نفس المقال، رابطين مختلفين، أيهما يحوّل أكثر؟
- [ ] **١٠.٤** Rate limiting + bot detection (لا نعدّ الزحف كضغطات)
- [ ] **١٠.٥** Webhook عند الوصول لعتبة (مثلاً ١٠٠٠ ضغطة) — تنبيه للعميل
- [ ] **١٠.٦** Export PDF للعميل بتقرير شهري (الروابط + الضغطات + القنوات)

---

## 📊 معايير النجاح

- ✅ ١٠٠٪ من روابط مودونتي تفتح في iPhone بدون أخطاء
- ✅ صفر `%D9%85` في أي رسالة مشاركة
- ✅ كل مقال + عميل + حدث = رابط قصير + QR Code جاهز
- ✅ العميل يقدر يشوف ضغطات روابطه في الكونسول
- ✅ الأدمن يقدر يدير + يلغي + يصدّر تقارير
- ✅ زمن التحويل عند ضغط الرابط: < ١٠٠ms (P95)
- ✅ صفر تبعية على Bitly أو طرف ثالث

---

## 🔗 المراجع

- مصدر المشكلة الأصلي: [SESSION-LOG.md](../context/SESSION-LOG.md) (نقاش 2026-05-21)
- توثيق Apple iOS URL handling: https://developer.apple.com/forums/thread/738432
- معيار RFC 3986: https://www.ietf.org/rfc/rfc3986.txt
- شركات بنت نظام مماثل: New York Times (`nyti.ms`) · Bloomberg (`bloom.bg`) · LinkedIn (`lnkd.in`)

---

## ✅ Done

> فارغ — لم نبدأ التنفيذ بعد. لما نخلص phase، ينقل سطره من فوق إلى هنا.
