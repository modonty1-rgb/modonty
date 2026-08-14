# PRD — «احجز الآن» / الإجراء الرئيسي للعميل (Primary Client CTA)

> **Status:** 🟡 DRAFT v0.1 — جلسة نقاش مفتوحة. لا كود قبل ما خالد يقول **"done"**.
> **Owner:** خالد · **Drafted:** 2026-06-05 · **آخر تحديث:** 2026-06-05
> **القاعدة:** نتناقش على هذا الملف لين نقفل كل البنود المفتوحة (❓) → بعدها one-shot تنفيذ.

---

## 1) المشكلة والهدف

**المشكلة:** عندنا الآن زرّان معطّلان (placeholders) في صفحة المقال — «احجز الآن» في الدوك السفلي للجوال، و«احجز أونلاين قريباً» في كارت العميل. والفكرة الأصلية «احجز الآن» تفترض إن كل عميل عنده «مواعيد»، بينما جمهور مُدوّنتي عريض (دكتور · محامي · مستشار · متجر إلكتروني · تاجر). فرض «احجز موعد» على متجر = بلا معنى.

**الهدف:** زرّ إجراء رئيسي **واحد**، **قابل للتهيئة لكل عميل**، يظهر في كل مكان يظهر فيه العميل (المقال + كارت العميل + صفحة العميل لاحقاً)، ويغذّي العميل بـ lead فوري عبر القنوات الموجودة عندنا أصلاً.

---

## 2) القرار الجوهري 🔒 (مقفول — اتفقنا عليه)

الزرّ **مو ثابت** — هو instance من «إجراء رئيسي» يتكوّن من ثلاثة أشياء:

```
الإجراء الرئيسي = النوع (mode) + التسمية (label) + الوجهة (target)
```

ونرتكز على **نوع الإجراء (action mode)**، مو على **المهنة**. (مهنتان متطابقتان قد يبغون إجراءين مختلفين، والربط بالمهنة يفرض جدول صيانة بلا فايدة.)

**النوعان (نبدأ باثنين فقط — KISS):**

| النوع | لمن | السلوك | التسمية الافتراضية |
|---|---|---|---|
| **`FORM`** فورم داخلي | خدمات (دكتور/محامي/مستشار) | يفتح فورم حجز → lead للعميل | «احجز الآن» |
| **`LINK`** رابط خارجي | متجر / واتساب / صفحة حجز جاهزة | يفتح رابط في تبويب جديد | «تسوّق الآن» |

**إجابة سؤال المتجر الإلكتروني = `LINK`** (يوديه لمتجره مباشرة، عنده checkout أصلاً). الواتساب المباشر والاتصال يندرجان تحت `LINK` (`wa.me/…` · `tel:…`) — فما نحتاج نوع ثالث.

---

## 3) إيش موجود فعلاً (دليل من الكود — نعيد استخدامه، ما نبنيه)

> هذا أهم قسم: **٨٠٪ من البنية التحتية موجودة.** الإضافة الحقيقية صغيرة.

| المكوّن | الحالة | الملف/الموديل | كيف نستخدمه |
|---|---|---|---|
| **Telegram للعميل** | ✅ كامل | `Client.telegramChatId` + ربط بكود (`telegramPairingCode/ExpiresAt/ConnectedAt`) + `telegramEventPreferences` (٢٢ حدث) + `lib/telegram/notify.ts` `notifyTelegram(clientId, eventKey, payload)` | نضيف حدث جديد `bookingRequest` + نستدعي `notifyTelegram` عند الحجز |
| **إشعارات داخلية** | ✅ موجود | `model Notification { userId, clientId, type, title, body, readAt, relatedId }` | نسجّل إشعار لمالك العميل (`Client.userId`) عند وصول حجز |
| **تتبّع CTA** | ✅ موجود | `model CTAClick` + `enum CTAType { BUTTON LINK FORM BANNER POPUP }` + `CtaTrackedLink` (مستخدم بالكارت) | كل ضغطة على زر الإجراء → `CTAClick` |
| **التحويلات** | ✅ موجود | `model Conversion` + `enum ConversionType { … DEMO_REQUEST PHONE_CLICK CONTACT_FORM … }` | حجز ناجح → `Conversion` |
| **GA4** | ✅ موجود | `lib/analytics/events-registry.ts` `trackEvent` | نضيف حدث حجز للـ GA4 |
| **تصنيف العميل** | ✅ موجود | `Client.industryId`→`Industry` · `isYmyl`+`ymylCategory` (medical/legal/financial) · `organizationType` | **ما نضيف «نوع عميل» جديد** — نضيف فقط حقول الإجراء |
| **رسائل تواصل** | ✅ موجود | `model ContactMessage { name, email, subject, message, status, replyBody, … }` | مرشّح لإعادة الاستخدام كمخزن للحجوزات (انظر القرار ❓2) |
| **فورم بروفايل الكونسول** | ✅ موجود | `console/.../profile/actions/profile-actions.ts` `updateProfile` (+ يستدعي `regenerateClientSeo`) | المكان المحتمل لتهيئة الإجراء من العميل (انظر ❓1) |
| **`Client.bookingUrl`** | ❌ غير موجود | — | placeholders فقط في `article-lab-bottom-dock.tsx` + `article-lab-client-card.tsx` |

---

## 4) تغييرات البيانات المقترحة (Data Model)

### 4.1 حقول جديدة على `Client`
```prisma
// Primary CTA — the single conversion action this client wants readers to take.
ctaMode  ClientCtaMode @default(NONE)  // FORM | LINK | NONE (NONE = لا يظهر زر)
ctaLabel String?                        // نص الزر (إن خالف الافتراضي)
ctaUrl   String?                        // لـ mode=LINK فقط: الوجهة الخارجية

enum ClientCtaMode { NONE FORM LINK }
```
> `NONE` افتراضي → **ما يظهر زر ميّت** لأي عميل غير مهيّأ (انظر ❓5).

### 4.2 موديل الحجوزات (لو اخترنا dedicated — انظر ❓2)
```prisma
model BookingRequest {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  clientId    String   @db.ObjectId
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  articleId   String?  @db.ObjectId      // من أي مقال جا الحجز (سياق)
  article     Article? @relation(fields: [articleId], references: [id], onDelete: SetNull)
  userId      String?  @db.ObjectId      // الزائر المسجّل (اختياري)
  name        String
  phone       String
  preferredAt DateTime?                   // الموعد المفضّل (اختياري)
  message     String?
  status      String   @default("new")    // new | contacted | done | archived
  ipAddress   String?
  userAgent   String?
  referrer    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([clientId, createdAt])
  @@index([status])
  @@map("booking_requests")
}
```

### 4.3 حدث Telegram جديد
في `modonty/lib/telegram/events.ts` نضيف للمجموعة `direct`:
```ts
{ key: "bookingRequest", group: "direct", label: "طلب حجز جديد", emoji: "📅" }
```
وندرجه ضمن التفضيلات الافتراضية = ON.

### 4.4 (اختياري) قيمة enum للتحويل
إمّا نعيد استخدام `ConversionType.DEMO_REQUEST` للحجز، أو نضيف `BOOKING`. (انظر ❓4)

> ⚠️ أي تعديل على `schema.prisma` = رقصة Prisma الإلزامية (إيقاف كل سيرفرات node → `prisma:generate` → إعادة التشغيل).

---

## 5) الأسطح (وين يظهر الزر)

1. **الدوك السفلي للجوال** (`article-lab-bottom-dock.tsx`) — زر «احجز الآن» المركزي. حالياً يفتح كارت العميل. الجديد: حسب `ctaMode` → فورم أو رابط، والنص = `ctaLabel`.
2. **كارت العميل** (`article-lab-client-card.tsx`) — زر «احجز أونلاين قريباً» المعطّل → يتفعّل حسب `ctaMode`.
3. **صفحة العميل** `/clients/[slug]` — زر بارز (مرحلة لاحقة، تتداخل مع شغل إعادة تصميم صفحة العميل — Track B).
4. أي مكان يظهر فيه العميل مستقبلاً.

> لو `ctaMode = NONE` → **ما يظهر أي زر** في كل الأسطح (لا أزرار ميتة).

---

## 6) التدفّقات (Flows)

### 6.1 `mode = FORM`
1. الزائر يضغط الزر → يفتح فورم (Sheet/Dialog): **الاسم · الجوال (إلزامي) · الموعد المفضّل (اختياري) · رسالة قصيرة**.
2. Submit → server action:
   - `auth()` (اختياري — الحجز مسموح للزائر غير المسجّل؟ انظر ❓3).
   - Zod `safeParse` → أخطاء حقول لو فشل.
   - إنشاء `BookingRequest` (أو `ContactMessage`).
   - إنشاء `Notification` لمالك العميل (`Client.userId`).
   - `notifyTelegram(clientId, "bookingRequest", { title, body, meta, link })`.
   - تسجيل `Conversion` + `CTAClick` + `trackEvent` (GA4).
   - `revalidatePath` حسب الحاجة → رجوع success.
3. العميل يشوف: رسالة Telegram خاصة + إشعار داخلي بالكونسول + الحجز في صندوق «الحجوزات» (مرحلة ❓6).

### 6.2 `mode = LINK`
1. الزائر يضغط الزر → تسجيل `CTAClick` (+ `Conversion` حسب ❓4) + `trackEvent` → فتح `ctaUrl` في تبويب جديد (`rel="noopener"`).

---

## 7) الملكية: مين يهيّئ الإجراء؟ ❓ (قرار مفتوح مهم)

- **اقتراح خالد:** الـ Admin يحدّده عند **تأسيس العميل**.
- **تعارض محتمل (من الذاكرة `project_client_field_ownership`):** بيانات بروفايل العميل (sameAs/description/العنوان…) يدخلها **العميل من الكونسول**، وفورم الأدمن تُركت بدونها عمداً.
- **اقتراحي للحل:** الأدمن يحدّد **النوع الافتراضي عند الـ onboarding** (قرار استراتيجي مرتبط بالباقة)، والعميل يقدر يعدّل **التسمية + الرابط** لاحقاً من الكونسول. (نناقش ونقفل.)

---

## 8) المراحل المقترحة (Phasing)

| Phase | الوصف | ملفات رئيسية | تحقّق |
|---|---|---|---|
| **1** | السكيما: حقول `Client` + enum `ClientCtaMode` + `BookingRequest` + حدث Telegram | `schema.prisma` · `lib/telegram/events.ts` | رقصة Prisma → tsc 0 |
| **2** | UI تهيئة الإجراء (أدمن و/أو كونسول حسب §7) | فورم العميل (admin) · `profile-actions.ts` (console) | حفظ + قراءة صحيحة |
| **3** | فورم الحجز + server action + إشعارات + tracking | component جديد + action جديد | إرسال حقيقي + Telegram + Notification |
| **4** | ربط زر الدوك + الكارت بالتهيئة الحقيقية | `article-lab-bottom-dock.tsx` · `article-lab-client-card.tsx` | الزر يشتغل حسب mode |
| **5** | صندوق «الحجوزات» بالكونسول (العميل يدير الـ leads) | صفحة كونسول جديدة | عرض/تحديث الحالة |
| **6** | زر صفحة العميل `/clients/[slug]` | (يتداخل مع Track B) | — |
| **7** | تست كامل + push | — | build + live test |

---

## 9) خارج النطاق (Out of Scope الآن)
- إعادة تصميم صفحة العميل بالكامل (Track B) — مهمة منفصلة بعد «احجز الآن».
- جدولة مواعيد حقيقية / تقويم / تأكيد تلقائي (الفورم يجمع lead فقط، مو نظام حجز كامل).
- الدفع.

---

## 10) القرارات المفتوحة ❓ (نقفلها وحدة وحدة)

- **❓1 — الملكية:** الأدمن يحدّد الإجراء عند التأسيس · أو العميل من الكونسول · أو الاثنين (أدمن افتراضي + كونسول يعدّل)؟
- **❓2 — مخزن الحجوزات:** موديل مخصّص `BookingRequest` (منظّم: جوال + موعد) · أو إعادة استخدام `ContactMessage` (أسرع، أقل تنظيماً)؟ — **ميلي: `BookingRequest`.**
- **❓3 — الحجز للزائر غير المسجّل:** مسموح بدون تسجيل دخول؟ (ميلي: نعم — تقليل الاحتكاك؛ نمنع السبام بـ rate-limit.)
- **❓4 — تحويل الرابط:** ضغطة `LINK` تُسجَّل كـ `Conversion`؟ وأي نوع enum للحجز (`DEMO_REQUEST` موجود · أو نضيف `BOOKING`)؟
- **❓5 — العميل غير المهيّأ:** نخفي الزر تماماً (`NONE`)؟ — **ميلي: نعم، لا أزرار ميتة.**
- **❓6 — صندوق الحجوزات بالكونسول:** ضمن النطاق الآن أو مرحلة لاحقة؟
- **❓7 — حقول الفورم:** اسم + جوال (إلزامي) + موعد مفضّل (اختياري) + رسالة — نأكّدها؟ نحتاج إيميل؟
- **❓8 — اقتراح تلقائي:** عملاء YMYL (medical/legal/financial) نخلّي الافتراضي عندهم `FORM` تلقائياً؟ (تحسين اختياري.)

---

> **بعد ما نقفل ❓1–❓8 → خالد يقول "done" → أبدأ Phase 1.**

المصطلحات الإنجليزية:
- Telegram · WhatsApp · GA4 · Prisma · Zod · checkout · CTA · YMYL · lead
