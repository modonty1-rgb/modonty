# إحالة عميل لعميل — العقد والحواجز

> **ملفّ الآلة، لا تسليمٌ لخالد.** آخر تحديث: ٢٩ أغسطس ٢٠٢٦.
> قاعدة العمل الوحيدة: `modonty_dev`. الإنتاج `modonty` لم يُمسّ ولن يُمسّ.
> `console-mobile/` خارج نطاقي — يستهلك العقد أدناه ولا يعرّفه.

---

## ١ · ما قِيس قبل أي سطر

كل رقم أدناه من `modonty_dev` في ٢٩ أغسطس، لا من ذاكرة ولا من افتراض.

```
جدول Country: 3 صفوف
   SA السعودية ✓ · EG مصر ✓ · AE الإمارات ✓

توزيع Client.addressCountry (36 عميلاً):
   "EG"                        → 28
   "SA"                        →  3
   null                        →  4
   "المملكة العربية السعودية"  →  1

Invoice: 15  |  منها paidAt مضبوط: 13

grep -c "^model ReferralLead" shared/prisma/schema/schema.prisma → 0
```

**الخلاصة الحاكمة:** `Client.addressCountry` **ليس ISO دائماً**. لا تعتمد الإحالة عليه:
المُحيل يكتب المفتاح الدولي داخل الرقم نفسه، ولا تُكتب `"SA"` في أي مكان كقيمة احتياطية.

---

## ٢ · النموذج — `ReferralLead`

المسار: `shared/prisma/schema/schema.prisma` (بعد `model Country`).

**لماذا نموذج مستقلّ ولا يُعاد استخدام غيره:**

| النموذج | لماذا لا يصلح |
|---|---|
| `ContactMessage` | رسالة زائر مجهول — بلا مُحيل، بلا مسار حالات، بلا مكافأة |
| `LeadScoring` | نقاطٌ تُحسب على **عميل قائم**، لا مُرشَّح خارجيّ |

خلط الإحالة بأيٍّ منهما يجعل كل استعلام لاحق يكذب: «كم إحالة تحوّلت؟» تصير سؤالاً
بلا جواب لأن الصفوف الثلاثة في مجموعة واحدة بمعانٍ ثلاثة.

**الحقول والسبب:**

| الحقل | النوع | السبب |
|---|---|---|
| `referrerClientId` | `ObjectId` → `Client` | مالك المكافأة. `onDelete: Cascade` |
| `candidateName` | `String?` | اختياري — الرقم وحده يكفي للتواصل |
| `candidateNote` | `String?` | ملاحظة اختيارية من المُحيل لفريق المتابعة |
| `phoneE164` | `String` | يكتب المُحيل `(+20) 100 123 4567` في حقل نص واحد؛ الخادم يتحقق منه ويخزنه E.164 فقط |
| `consentConfirmedAt` | `DateTime` **إلزامي** | بلا موافقة **لا يُنشأ الصفّ**. شرطُ وجودٍ لا خانةٌ في نموذج |
| `status` | `ReferralLeadStatus` | `NEW → CONTACTED → SUBSCRIBED → PAID → REWARDED`، ونهايتان: `REJECTED` (رفض صريح) · `LOST` (انقطاع) |
| `contactedAt` · `subscribedAt` · `paidAt` · `rewardedAt` | `DateTime?` | السجلّ الزمني. كلٌّ يُكتب مرّة عند دخول حالته |
| `paidInvoiceId` | `ObjectId?` | الفاتورة التي أثبتت السداد — مصدر `paidAt` |
| `convertedClientId` | `ObjectId?` | العميل الذي صار منه المُرشَّح |
| `closingNote` | `String?` | سبب الرفض/الانقطاع بخطّ الأدمن |
| `createdAt` · `updatedAt` | | |

**الفهارس:**
```prisma
@@unique([referrerClientId, phoneE164])   // لا إحالتان لنفس الرقم من نفس المُحيل
@@index([status, createdAt])              // شاشة الإدارة
@@index([referrerClientId, createdAt])    // «آخر إحالاتي» في الموبايل
```

الزوج الفريد **لا يمنع** إحالة نفس الرقم من مُحيل آخر — ذلك قرارٌ تجاريّ يفصله الأدمن،
لا قيدٌ في القاعدة.

---

## ٣ · 🚧 الحاجز — أمران بيد خالد وحده

النموذج مكتوب في الملفّ، و**لا سطر بعده يترجم** حتى يُولَّد عميل Prisma.

```bash
# ١ — إغلاق كل ما يمسك @prisma/client (قاعدة الجهاز: كل تعديل سكيما يبدأ بهذا)
taskkill //F //IM node.exe

# ٢ — توليد العميل
pnpm prisma:generate

# ٣ — إنشاء المجموعة والفهارس على modonty_dev فقط
#     ⚠️ تحقّق من DATABASE_URL قبله: يجب أن ينتهي بـ /modonty_dev
pnpm prisma db push
```

**لماذا لا أنفّذها أنا:**
- `prisma db push` — منعتَه صراحةً في تعليمات المهمّة.
- `taskkill node` — يقتل سيرفرَي Codex الحيّين (`port 3100` + Expo) وأي كاسكيد شغّال.

**قبل التنفيذ:** نسّق مع Codex، فالأمر يُسقط شغله.

---

## ٤ · عقد الـAPI

يتبع نمط `console/app/api/mobile/v1/**` القائم حرفياً: `mobileSessionFromRequest(request)`
→ `session.clientId`، و`ok()`/`fail(code, نصّ عربي)` من `@/lib/mobile-api/http`.
**كل نصّ يراه المستخدم يُنهى في الخادم** — الشاشة لا تركّب جملة ولا تحمل نصّاً ثابتاً.

### `GET /api/mobile/v1/referral`

```jsonc
{
  "screen": {
    "title": "…", "subtitle": "…",
    "consentLabel": "…",            // نصّ خانة الموافقة
    "submitLabel": "…",
    "emptyLabel": "…"               // حين لا توجد إحالات
  },
  "lastReferral": {
    "candidateName": "…", "phoneMasked": "…",
    "statusLabel": "…", "statusKey": "CONTACTED",
    "timeline": [ { "label": "…", "at": "…" } ]
  }
}
```

### `POST /api/mobile/v1/referral`

المدخل: `{ candidateName?, candidateNote?, phone: "(+20) 100 123 4567", consent: true }`

| الفحص | الخطأ حين يسقط |
|---|---|
| جلسة صالحة | `UNAUTHORIZED` — «سجّل الدخول للمتابعة.» |
| الرقم يطابق `(+مفتاح) رقم` ثم يمر بطول E.164 | `VALIDATION_ERROR` — «اكتب رقم الجوال بصيغة (+مفتاح) رقم.» |
| `consent === true` | `CONSENT_REQUIRED` — «أكّد أن صاحب الرقم موافق على التواصل.» |
| الزوج غير مكرّر | `DUPLICATE` — «أرسلت هذا الرقم من قبل.» |

النجاح يكتب الصفّ بـ`consentConfirmedAt = now()` و`status = NEW`.

---

## ٥ · ربط المكافأة بالسداد — الحدث موجود ونقطته واحدة

`admin/app/(dashboard)/clients/[id]/account/actions/mark-paid.ts:55`
```ts
data: { paymentStatus: "PAID", paidAt, paidByUserId: session.user.id ?? null }
```
وقبله في `:49` حارس جاهز: `if (invoice.paymentStatus === "PAID") return { ok:false, … }`.

**عدم التكرار مضمون بشرطين معاً:** الحارس القائم أعلاه، و`rewardedAt == null` على صفّ
الإحالة. فإعادة تشغيل العملية لا تمنح شهراً ثانياً.

**⚠️ ما يجب أن يُقال بصراحة:** هذا الحدث **يدوي بيد موظّف الأدمن، لا بوّابة دفع**.
١٣ من ١٥ فاتورة عليها `paidAt`. فالمكافأة ستُمنح على إقرار موظّف — وهذا قرار خالد لا قراري.
**لا أفبرك حدثاً ولا أخمّن سداداً**؛ إن رفض هذا الأساس، تبقى `PAID → REWARDED` خطوة يدوية
في شاشة الإدارة، والحقل `paidInvoiceId` يبقى مكانه جاهزاً ليوم تصل فيه بوّابة حقيقية.

---

## ٦ · ما تمّ وما لم يتمّ

**تمّ:**
- قياس مصادر البلد والسداد على `modonty_dev` (§١).
- `enum ReferralLeadStatus` + `model ReferralLead` + علاقة `Client.referralLeads` — مكتوبة في `schema.prisma`.
- هذا العقد، لتستهلكه `console-mobile` بلا انتظاري.

**لم يتمّ — محجوب بالحاجز في §٣:**
- المسارات · شاشة الإدارة · ربط `mark-paid` · كل اختبار.
  السبب واحد: `db.referralLead` غير موجود في العميل المولَّد، فلا يترجم سطر ولا يُقاس شيء.

**قرارات خالد:**
1. متى نوقف كل شيء (Codex + الكاسكيد) لتنفيذ الأمرين الثلاثة في §٣؟
2. المكافأة تُربط بـ`mark-paid` اليدوي، أم تنتظر بوّابة دفع؟
3. لا قرار بلد افتراضي: المفتاح الدولي جزء إلزامي من حقل الهاتف النصي.
