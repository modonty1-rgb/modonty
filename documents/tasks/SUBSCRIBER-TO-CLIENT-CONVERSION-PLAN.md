# خطة تحويل مشترك jbrseo إلى عميل (Subscriber → Client Conversion)

> **تاريخ الإنشاء:** 2026-05-28
> **الحالة:** قيد المراجعة من خالد قبل التنفيذ
> **المدة المتوقّعة:** ~2.5 ساعة عمل فعلي

---

## 🎯 الهدف

تحويل المشترك القادم من `jbrseo.com` (موجود في تبويب **jbrseo Subscribers** على صفحة `/clients`) إلى عميل حقيقي في النظام بضغطة زر، مع flow احترافي:

1. ضغط زر "تحويل إلى عميل" في admin
2. إنشاء عميل بحالة PENDING + إرسال إيميل ترحيب
3. العميل يدخل console بنفسه، يكمّل بياناته، يغيّر كلمة المرور
4. الفريق يتأكّد + يضغط زر "تفعيل" في admin → العميل ACTIVE + السلَج يُقفل

---

## 📋 القرارات المُتفَّق عليها (مرجع سريع)

| الموضوع | القرار |
|---|---|
| **كلمة المرور الأولية** | = الإيميل (نص ظاهر، آمن لأنه مفيش مدفوعات) |
| **مكان الإعداد** | console الموجود — العميل يتبع تعليمات الإيميل، لا تعديلات على UX console |
| **متى يتحوّل PENDING → ACTIVE** | يدوياً — الفريق يضغط زر "تفعيل" في admin بعد تأكّده مع العميل |
| **هل admin يقدر يعدّل بدلاً عن العميل؟** | نعم (السلوك الحالي شغّال — admin يقدر يعدّل كل شي في `/clients/[id]/edit`) |
| **العميل غير نشط لفترة طويلة** | لا أتمتة — الفريق يتابع يدوياً |
| **قفل السلَج** | بعد التحويل من PENDING → ACTIVE، السلَج يُقفل نهائياً (تغييره يكسر URLs + JSON-LD + sitemap) |
| **مكان زر "تفعيل"** | في عمود Status الموجود في جدول `/clients` — بدون عمود جديد |
| **مكان زر "تحويل إلى عميل"** | في كل صف من تبويب jbrseo Subscribers |
| **هل العميل المحوَّل يظل في تبويب jbrseo؟** | نعم، مع بادج "تم التحويل" + رابط لصفحة العميل (للتتبّع) |

---

## ⚠️ نقاط القرار المتبقّية (تحتاج تأكيد قبل البدء)

### 1. مطابقة الباقات — ✅ محسوم (لا جدول يدوي)

**القرار (خالد 2026-05-29):** الباقات تُجلب من جبر SEO، ما نعمل مطابقة يدوية.

مفتاح الربط = **اسم الباقة** (`planName`):
- `JbrseoSubscriber.planName` يحمل: `مجاني` / `الانطلاقة` / `الزخم` / `الريادة`
- `SubscriptionTierConfig.name` يحمل نفس الاسم بالضبط (مُزامَن من جبر SEO)

منطق التحويل:
```ts
const config = await db.subscriptionTierConfig.findFirst({
  where: { name: subscriber.planName },
});
// من الـ config:
Client.subscriptionTier  = config.tier            // الـ enum (BASIC/STANDARD/PRO/PREMIUM)
Client.tierConfigId      = config.id              // علاقة ClientTierConfig
Client.articlesPerMonth  = config.articlesPerMonth
// السعر للعرض فقط:
config.pricing[subscriber.country]                // { mo, yr } حسب SA/EG
```

> الـ enum الفعلي: `BASIC` · `STANDARD` · `PRO` · `PREMIUM` (لا يوجد `FREE`). لكننا **لا نلمسه يدوياً** — ناخذ `tier` من الـ config مباشرة.
> **حالة الحافة:** لو `config` = null (اسم باقة غير موجود في الجدول) → الـ action يرجع خطأ واضح "الباقة غير معروفة — شغّل sync الباقات أولاً".

### 2. سلوك إيميل الترحيب في مرحلة الـ test

- **(أ)** نطبع محتوى الإيميل في console الـ dev (لا إرسال فعلي) — أسرع للتطوير
- **(ب)** نرسل فعلياً لـ `one@modonty.com` (يجب التأكّد أن الإيميل موجود ويستقبل)

> ❓ **سؤال:** أيها تفضّل لمرحلة الـ test؟

---

## 🛠️ المراحل التنفيذية (7 مراحل)

### 📐 المرحلة 1 — تحديث المخطّط (Schema) — ✅ DONE (2026-05-29)

**الملف:** `dataLayer/prisma/schema/schema.prisma`

**التغييرات على `JbrseoSubscriber` (حقلان فقط، بدون relation رسمية):**
```prisma
convertedToClientId String?   @db.ObjectId   // null = لسه، موجود = اتحوّل لعميل
convertedAt         DateTime?
// + @@index([convertedToClientId])
```

> قرار: **لا relation رسمية** — حقل `String?` يكفي، الـ UI يبني الرابط `/clients/{id}` يدوياً. هذا يتجنّب لمس موديل Client.

**تم:**
1. ✅ قتل عمليات Node (10 عمليات)
2. ✅ `pnpm prisma:validate` → valid 🚀
3. ✅ `pnpm prisma:generate` → Prisma Client v6.19.2
4. ✅ إعادة تشغيل dev:admin

**زمن فعلي:** ~5 دقائق · **مخاطر:** صفر

---

### 🧪 المرحلة 2 — حساب اختبار

**الملف الجديد:** `admin/scripts/seed-test-subscriber.ts` (يُحذف بعد التست)

**المحتوى:**
```typescript
// ينشئ JbrseoSubscriber باسم "Modonty Test"
// email: one@modonty.com
// businessName: "Modonty Test"
// phone: +966500000001
// planName: "مجاني"
// country: "SA"
// isAnnual: true
```

**الإجراء:**
1. `pnpm tsx admin/scripts/seed-test-subscriber.ts`
2. التحقّق من ظهوره في `/clients` → تبويب jbrseo Subscribers
3. عدد الـ subscribers يصير 13 (كان 12)

**زمن:** ~10 دقائق

---

### ⚙️ المرحلة 3 — Backend (Server Action + Email)

**الملف الجديد:** `admin/app/(dashboard)/clients/actions/convert-subscriber-to-client.ts`

**الواجهة:**
```typescript
convertSubscriberToClientAction({
  subscriberId: string,
  slug: string,         // إجباري — admin يدخله بالعربي
  industryId?: string,  // اختياري — العميل يقدر يختاره لاحقاً
}): Promise<{ ok: boolean; clientId?: string; error?: string }>
```

**ما يفعله الـ action:**
1. `requireAuth()` — فقط admin مسموح
2. يتحقّق: `JbrseoSubscriber` موجود + لم يُحوَّل بعد
3. يتحقّق: `slug` فريد في جدول `Client`
4. يجلب `SubscriptionTierConfig` بمطابقة `name === subscriber.planName` (لو null → خطأ)
5. يبني payload الـ Client:
   - `name` = `subscriber.businessName`
   - `email` = `subscriber.email`
   - `phone` = `subscriber.phone`
   - `slug` = من المدخلات
   - `password` = `bcrypt(subscriber.email, 10)`
   - `subscriptionTier` = `config.tier`
   - `tierConfigId` = `config.id` (علاقة ClientTierConfig)
   - `subscriptionStatus` = `PENDING`
   - `paymentStatus` = `PENDING`
   - `articlesPerMonth` = `config.articlesPerMonth`
   - `industryId` = من المدخلات (لو موجود)
5. `db.client.create({ data: ... })`
6. تحديث `JbrseoSubscriber.convertedToClientId` + `convertedAt`
7. إرسال إيميل ترحيب (Resend)
8. `revalidatePath('/clients')`
9. إرجاع `{ ok: true, clientId }`

**قالب الإيميل الجديد:** `admin/lib/emails/client-welcome.tsx` (React Email)

محتوى الإيميل (عربي، RTL):
```
مرحباً بك في مُدَوَّنَتِي [اسم العميل]!

تم إنشاء حسابك بنجاح. للبدء، اتّبع الخطوات التالية:

🔑 بيانات الدخول:
   • الرابط: https://console.modonty.com
   • اسم المستخدم (إيميل): [email]
   • كلمة المرور: [email] (نفس الإيميل مؤقتاً)

📋 الخطوات الأولى (مهمة):

   1️⃣ سجّل دخول من الرابط أعلاه
   2️⃣ اذهب لـ "معلومات الشركة" وأكمل بياناتك (عنوان، شعار، إلخ)
   3️⃣ اذهب لـ "بيانات شركتك" وغيّر كلمة المرور لشيء قوي

⏱️ بعد اكتمال بياناتك، فريقنا حيتواصل معاك لتفعيل حسابك بشكل كامل.

للمساعدة، رد على هذا الإيميل في أي وقت.

— فريق مُدَوَّنَتِي
```

**زمن:** ~30 دقيقة

---

### 🖱️ المرحلة 4 — UI زر "تحويل إلى عميل" — ✅ DONE (2026-05-29)

> نُفّذ على `subscribers-table.tsx` (مكان عرض المشتركين فعلياً) بدل clients-tabs.tsx. عمود Action: زر "تحويل إلى عميل" للمشتركين غير المحوَّلين · بادج أخضر "تم التحويل" + رابط `/clients/{id}` للمحوَّلين. Dialog جديد `convert-subscriber-dialog.tsx` (slug إجباري + ملخص قراءة-فقط). القطاع يُترك للتعديل لاحقاً (الـ action يقبله optional لكن الـ dialog v1 يكتفي بالسلَج). TSC نظيف.

**(الخطة الأصلية):** التحديث على `clients-tabs.tsx` (داخل تبويب jbrseo Subscribers)

**التغييرات:**
1. عمود جديد "Action" في جدول `SubscribersTable`
2. لكل صف:
   - لو `convertedToClientId === null` → زر **"تحويل إلى عميل"** أزرق
   - لو `convertedToClientId !== null` → بادج "تم التحويل" أخضر + رابط للعميل (`/clients/{clientId}`)
3. اضغط الزر → يفتح Dialog (نافذة) جديدة:
   - **عنوان:** "تحويل [اسم] إلى عميل جديد"
   - **عرض البيانات (قراءة فقط):** الاسم، الإيميل، الجوال، الباقة، الدولة
   - **حقل إجباري:** السلَج (مع توضيح: "هذا سيظهر في رابط العميل العام، يقدر العميل يعدّله من console قبل التفعيل")
   - **حقل اختياري:** قائمة منسدلة للقطاع (يمكن تركها فارغة)
   - **زر "تأكيد التحويل"** → يستدعي `convertSubscriberToClientAction`
4. على النجاح: toast أخضر + Dialog يقفل + الجدول يتحدّث (router.refresh)

**الملف الجديد:** `admin/app/(dashboard)/clients/components/convert-subscriber-dialog.tsx`

**زمن:** ~30 دقيقة

---

### 🚀 المرحلة 5 — زر "تفعيل" + قفل السلَج

#### 5أ — زر "تفعيل" ✅ DONE (2026-05-29)
- ملف جديد `admin/app/(dashboard)/clients/actions/activate-client.ts` (auth + status→ACTIVE + subscriptionStartDate + revalidate)
- ملف جديد `admin/app/(dashboard)/clients/components/activate-client-button.tsx` (AlertDialog تأكيد)
- في `client-table.tsx` عمود Status: للعملاء بحالة PENDING يظهر بادج "Pending" + زر "Activate" أخضر تحته. TSC نظيف.

#### 5ب — قفل السلَج ✅ محسوم: لا عمل مطلوب (2026-05-29)
**اكتشاف:** السلَج محمي أصلاً في كل مكان:
- **admin:** read-only + badge "locked" + التغيير الوحيد عبر **OTP على Telegram** (`slug-change-dialog.tsx` + `slug-change-otp.ts`)
- **console:** ما فيه حقل slug إطلاقاً — العميل ما يقدر يلمسه

**قرار خالد (2026-05-29):** الـ OTP الموجود كافٍ — ما نضيف أي حارس إضافي. القفل محسوم. مفيش أي مسار يغيّر السلَج بدون OTP.

**(الخطة الأصلية للقفل):**

**في عمود Status:**
- لو `subscriptionStatus === 'PENDING'` → نعرض:
  - بادج برتقالي "Pending"
  - بجنبه زر صغير **"تفعيل"** (أيقونة CheckCircle أخضر)
- لو `subscriptionStatus === 'ACTIVE'` → السلوك الحالي بدون تغيير

**عند ضغط "تفعيل":**
1. يفتح AlertDialog: "تأكيد تفعيل العميل — السلَج سيُقفل نهائياً، لا يمكن تغييره بعد الآن. هل أنت متأكد؟"
2. "نعم، فعّل" → استدعاء `activateClientAction(clientId)`
3. Server action:
   - `requireAuth`
   - `db.client.update({ where: { id }, data: { subscriptionStatus: 'ACTIVE' } })`
   - `revalidatePath('/clients')`
4. على النجاح: toast أخضر "تم تفعيل العميل" + الجدول يتحدّث

**ملف جديد:** `admin/app/(dashboard)/clients/actions/activate-client.ts`

**منطق قفل السلَج:**

**التحديث على:** `admin/app/(dashboard)/clients/actions/clients-actions/update-client.ts`
- قبل الـ update: لو `existingClient.subscriptionStatus === 'ACTIVE'` + المدخلات تحتوي `slug` + المدخل ≠ القديم → إرجاع خطأ "السلَج مقفول بعد التفعيل، لا يمكن تعديله"

**التحديث على:** `admin/app/(dashboard)/clients/components/form-sections/basic-info-section.tsx`
- لو `client.subscriptionStatus === 'ACTIVE'` → حقل السلَج `disabled` + tooltip "السلَج مقفول بعد التفعيل"

**التحديث على:** `console/app/(dashboard)/dashboard/profile/components/profile-form.tsx` (نفس المنطق للعميل من جانبه)

**زمن:** ~25 دقيقة

---

### 🧪 المرحلة 6 — Live Test الكامل (Playwright)

**خطوات الاختبار:**

1. **تحويل المشترك:**
   - افتح `/clients` → تبويب jbrseo Subscribers
   - الصف "Modonty Test" يعرض زر "تحويل إلى عميل"
   - اضغط الزر → Dialog يفتح
   - أدخل سلَج: `modonty-test`
   - اترك القطاع فارغ
   - اضغط "تأكيد التحويل"
   - **توقّع:** toast نجاح + الصف يعرض بادج "تم التحويل" + DB فيه Client جديد بـ status=PENDING

2. **تحقّق الإيميل:**
   - افتح console السيرفر → يجب نشوف log محتوى الإيميل (مرحلة test)
   - إذا اخترنا الإرسال الفعلي → نتحقّق من `one@modonty.com`

3. **تسجيل دخول العميل:**
   - افتح `console.modonty.com` (port 3001)
   - email: `one@modonty.com` + password: `one@modonty.com`
   - **توقّع:** دخول ناجح، نزول للوحة التحكم

4. **تعديل البيانات:**
   - افتح `/dashboard/profile`
   - عدّل العنوان + الوصف
   - احفظ
   - **توقّع:** toast حفظ + البيانات تظهر في admin أيضاً

5. **محاولة تعديل السلَج (يجب أن تنجح):**
   - في profile، حاول تغيير السلَج من `modonty-test` إلى `modonty-test-v2`
   - **توقّع:** يتم الحفظ بنجاح (لأن status لسه PENDING)

6. **التفعيل:**
   - افتح admin → `/clients`
   - الصف "Modonty Test" يعرض بادج "Pending" + زر "تفعيل"
   - اضغط "تفعيل" → AlertDialog → "نعم"
   - **توقّع:** toast نجاح + status يصير "Active"

7. **محاولة تعديل السلَج بعد التفعيل (يجب أن تفشل):**
   - في console profile، حاول تغيير السلَج مرة أخرى
   - **توقّع:** خطأ "السلَج مقفول بعد التفعيل، لا يمكن تعديله"
   - في admin → `/clients/{id}/edit`، حقل السلَج disabled

8. **تشييك DB قبل/بعد:**
   - استعلامات للتحقّق من:
     - `JbrseoSubscriber.convertedToClientId` ليس null
     - `Client.subscriptionStatus` = ACTIVE
     - `Client.password` مُشفّر bcrypt
     - أي تغييرات أخرى

**زمن:** ~20 دقيقة

---

### 🧹 المرحلة 7 — Cleanup + TSC + Push

1. حذف Test Client من DB (سكربت): `pnpm tsx admin/scripts/cleanup-test-subscriber.ts`
2. حذف ملف seed-test-subscriber.ts + cleanup-test-subscriber.ts نهائياً
3. تشغيل TSC: `NODE_OPTIONS="--max-old-space-size=8192" pnpm tsc --noEmit` (ينبغي يكون صفر أخطاء)
4. تحديث `add-changelog.ts` بـ entry جديد v0.65.4 (admin)
5. تحديث `package.json` 0.65.3 → 0.65.4
6. تحديث SESSION-LOG.md + هذا الملف بـ "DONE"
7. `bash scripts/backup.sh` (backup PROD)
8. `git add` للملفات المعدّلة + commit
9. `git push origin main`
10. `cd admin && pnpm changelog`

**زمن:** ~15 دقيقة

---

## 📊 ملخص الملفات المتأثّرة

| نوع | عدد |
|---|---|
| ملفات جديدة | 5 (action تحويل + dialog تحويل + قالب إيميل + action تفعيل + سكربت seed) |
| ملفات معدّلة | 7 (schema + clients-tabs + client-table + update-client + 2 profile forms + add-changelog) |
| ملفات محذوفة | 2 (سكربتات الـ test بعد الانتهاء) |

---

## ⚠️ مخاطر مُحتمَلة + خطط الاحتياط

| المخاطرة | الاحتياط |
|---|---|
| Resend ما يرسل الإيميل (مفتاح API منتهي) | في مرحلة الـ test نطبع في console، نختبر فعلياً بعد إصلاح المفتاح |
| السلَج الذي أدخله admin مكرّر في DB | الـ action يتحقّق + يرجع خطأ واضح |
| العميل ينسى يغيّر كلمة المرور | الإيميل يوضّح ذلك بوضوح، لكن لا قسر — قرار خالد |
| عميل اتحوّل بالخطأ (يحتاج عكس) | نضيف زر "إلغاء التحويل" لاحقاً (خارج هذه الخطة) |

---

## ✅ معايير القبول (Definition of Done)

- [ ] Schema محدّث + types مولّدة بدون أخطاء
- [ ] حساب test تم إنشاؤه وظهر في تبويب jbrseo Subscribers
- [ ] زر "تحويل" يعمل، يفتح Dialog، يحفظ Client بنجاح
- [ ] إيميل الترحيب يطبع/يرسل بمحتوى صحيح
- [ ] تسجيل دخول العميل بالإيميل ككلمة مرور يعمل
- [ ] العميل يقدر يعدّل profile + السلَج أثناء PENDING
- [ ] زر "تفعيل" في admin يحوّل لـ ACTIVE
- [ ] بعد ACTIVE: السلَج مقفول، لا يمكن تعديله من admin أو console
- [ ] TSC صفر أخطاء
- [ ] Test data تم حذفه
- [ ] Push + changelog

---

> **في انتظار:** تأكيد خالد على نقاط القرار المتبقّية (مطابقة الباقات + سلوك الإيميل في الـ test) قبل البدء بالمرحلة 1.
