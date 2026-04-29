# دليل تشغيل بوت تيليجرام لإشعارات Engagement

> **الفكرة:** بوت واحد موحّد (`@ModontyAlertsBot`) يخدم كل العملاء. كل عميل يربط حسابه بكود من 6 أرقام، ويختار من 26 حدث engagement أيّها يريد استلامها على تيليجرام.

---

## القسم الأول — المطلوب منك كـ Modonty (مرة واحدة فقط)

### الخطوة 1 — إنشاء البوت من @BotFather

1. افتح Telegram، ابحث عن **@BotFather** وافتح المحادثة.
2. أرسل: `/newbot`
3. اختر اسمًا مرئيًا للبوت — مثلاً: `Modonty Alerts`
4. اختر username للبوت — لازم ينتهي بـ `bot`، مثلاً: `ModontyAlertsBot`
5. **انسخ الـ token** اللي يرجعه لك BotFather. شكله:
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
   ```
   ⚠️ هذا الـ token سرّي — لا تنشره في git أو بأي مكان عام.

6. **(اختياري لكن مستحسن)** عيّن وصف للبوت:
   - `/setdescription` ← اختر بوتك ← أرسل: `بوت إشعارات engagement من مدونتي.`
   - `/setabouttext` ← أرسل: `إشعارات تعليقات، أسئلة، وتفاعلات على مقالاتك.`
   - `/setuserpic` ← ارفع شعار مدونتي

7. **(اختياري)** اضبط أوامر القائمة:
   - `/setcommands` ← اختر بوتك ← أرسل:
     ```
     start - بدء الربط
     help - المساعدة
     ```

---

### الخطوة 2 — إعداد متغيرات البيئة (env vars)

أضف هذي الثلاث متغيرات في **3 أماكن**:

#### أ) محلياً للتطوير

في الملف **`console/.env.local`**:
```env
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz1234567890"
TELEGRAM_BOT_USERNAME="ModontyAlertsBot"
TELEGRAM_WEBHOOK_SECRET="<عشوائي-32-حرف>"
```

في الملف **`modonty/.env.local`**:
```env
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz1234567890"
```
> فقط الـ TOKEN لأن modonty يرسل الإشعارات بس، ما عنده UI للربط.

#### ب) على Vercel للإنتاج

1. ادخل **Vercel Dashboard → Project: console → Settings → Environment Variables**
2. أضف الثلاث variables (Production environment):
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_BOT_USERNAME`
   - `TELEGRAM_WEBHOOK_SECRET`
3. ادخل **Project: modonty → Settings → Environment Variables**
4. أضف فقط:
   - `TELEGRAM_BOT_TOKEN`

> 💡 **توليد قيمة للـ secret:** افتح PowerShell وشغّل:
> ```powershell
> [System.Web.Security.Membership]::GeneratePassword(32, 0)
> ```
> أو على Linux/Mac: `openssl rand -hex 32`

---

### الخطوة 3 — تسجيل الـ webhook على Telegram (مرة واحدة)

شغّل هذا الـ curl من جهازك (بعد ما يكون console.modonty.com منشور):

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://console.modonty.com/api/telegram/webhook",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>"
  }'
```

**استبدل:**
- `<TOKEN>` بالـ token من BotFather
- `<TELEGRAM_WEBHOOK_SECRET>` بنفس القيمة اللي وضعتها في Vercel

**النتيجة المتوقعة:**
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

---

### الخطوة 4 — التحقق من تشغيل الـ webhook

```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

**ابحث عن:**
- `"url": "https://console.modonty.com/api/telegram/webhook"` ✅
- `"pending_update_count": 0` ✅
- `"last_error_message"` غير موجود ✅

لو طلع `last_error_message` — راجع الـ logs في Vercel.

---

### الخطوة 5 — اختبار محلي قبل الإنتاج (اختياري)

للاختبار محلياً، Telegram لا يقدر يصل لـ `localhost:3001`. الحل:

1. ثبّت **ngrok**: `npm i -g ngrok` (أو من ngrok.com)
2. شغّل console: `cd console && pnpm dev` (يفتح على :3001)
3. في terminal آخر: `ngrok http 3001` ← يطلع لك URL مثل `https://abc123.ngrok.app`
4. سجّل webhook مؤقت بنفس الـ curl لكن استبدل URL:
   ```
   "url": "https://abc123.ngrok.app/api/telegram/webhook"
   ```
5. جرّب الربط من حساب tester
6. لما تخلص، أعد تسجيل الـ webhook على `console.modonty.com` للإنتاج

---

### الخطوة 6 — الـ Health Check اليومي

أضف لقائمة مهامك:
- [ ] راقب `getWebhookInfo` مرة بالأسبوع — تأكد ما في `pending_update_count` كبير ولا أخطاء
- [ ] راقب logs Vercel على `/api/telegram/webhook` — لو في 4xx/5xx متكرر، اشتباه في token منتهي أو secret خاطئ
- [ ] لو غيّرت الـ secret، أعد تشغيل setWebhook curl

---

## القسم الثاني — المطلوب من العميل كخطوات (داخل console)

### ⏱ الوقت المطلوب: دقيقتان

### الخطوة 1 — افتح صفحة الإعدادات
ادخل **console.modonty.com → الإعدادات** من القائمة الجانبية.

ستجد كرت بعنوان **"Telegram"** فيه:
- شارة "غير مربوط" بلون رمادي
- 3 خطوات مشروحة
- زر **"توليد كود ربط"**

### الخطوة 2 — اضغط "توليد كود ربط"
سيظهر لك **كود من 6 أرقام** (مثلاً: `482915`) داخل صندوق مميّز، مع:
- زر **"نسخ"** بجوار الكود
- ملاحظة: "صالح حتى" + الوقت (10 دقائق من الآن)

### الخطوة 3 — افتح بوت Telegram
اضغط على الرابط الظاهر في الخطوة 1 (`https://t.me/ModontyAlertsBot`) — يفتح Telegram في تبويبة جديدة.

### الخطوة 4 — ابدأ المحادثة
في Telegram:
1. اضغط زر **"Start"** (أو اكتب `/start`)
2. البوت يرحّب بك:
   ```
   👋 أهلاً بك في إشعارات مدونتي.
   لربط حسابك:
   1. افتح صفحة الإعدادات في console.modonty.com
   2. اضغط «ربط Telegram» — راح يطلع لك كود من 6 أرقام
   3. ارجع هنا وأرسل الكود
   ```

### الخطوة 5 — أرسل الكود
اكتب الـ 6 أرقام اللي نسختها من console (مثلاً `482915`) وأرسلها للبوت.

البوت سيرد فورًا:
```
✅ تم الربط بنجاح!
شركتك: <اسم شركتك>
من الآن، إشعارات مدونتي راح توصلك هنا حسب اللي اخترته في الإعدادات.
```

### الخطوة 6 — ارجع لـ console
أعد تحميل صفحة الإعدادات. ستجد:
- شارة "مربوط" بلون أخضر ✅
- بطاقة معلومات تحوي تاريخ الربط
- زرّان: **"إرسال رسالة اختبار"** و **"فصل الربط"**

### الخطوة 7 — اختر الإشعارات اللي تبغاها
تحت قسم **"الإشعارات اللي تبغاها"** ستجد **26 خيار** موزّعين على 3 أقسام:

#### 📰 أحداث المقال (15)
- مشاهدة مقال 👁
- لايك على مقال 👍
- ديسلايك على مقال 👎
- حفظ مقال في المفضلة ⭐
- مشاركة مقال ↗
- ضغط على CTA داخل المقال 🎯
- ضغط على رابط خارجي داخل المقال 🔗
- تعليق جديد 💬
- رد على تعليق ↩
- لايك على تعليق 👍
- ديسلايك على تعليق 👎
- سؤال جديد من قارئ ❓
- اشتراك في النشرة من المقال 📧
- تحويل (Conversion) 🎉
- Lead باهتمام عالٍ 🔥

#### 🏢 أحداث صفحة الشركة (8)
- زيارة صفحة الشركة 👁
- متابعة الشركة ➕
- مشاركة صفحة الشركة ↗
- لايك للشركة 👍
- ديسلايك للشركة 👎
- حفظ صفحة الشركة ⭐
- تعليق على صفحة الشركة 💬
- اشتراك مباشر بالشركة 📧

#### 📨 تواصل مباشر (3)
- رسالة دعم جديدة 📩
- تسجيل اهتمام بحملة 📣
- سؤال مباشر للشركة 🙋

كل قسم له زرّان: **"تحديد الكل"** و **"إلغاء الكل"** للتسريع.

### الخطوة 8 — احفظ التفضيلات
اضغط زر **"حفظ"** في أسفل القسم. ستظهر رسالة: "تم حفظ تفضيلاتك."

### الخطوة 9 — اختبار
اضغط زر **"إرسال رسالة اختبار"**. خلال ثوانٍ ستصلك رسالة في Telegram:
```
🧪 رسالة اختبار
الربط شغّال — راح تستلم إشعارات <اسم شركتك> هنا.
```

✅ **الربط مكتمل والإشعارات بدأت تشتغل.**

---

## أسئلة شائعة

### هل يقدر فريق العمل يستلم نفس الإشعارات؟
نعم. أنشئ **مجموعة Telegram خاصة بفريقك** ← أضف `@ModontyAlertsBot` إليها كـ admin ← اعمل `/start` من داخل المجموعة. الكود اللي يطلع يربط المجموعة كلها (وليس حسابك الشخصي).

### هل أقدر أوقف الإشعارات مؤقتاً؟
نعم. ادخل صفحة الإعدادات → في كرت Telegram، شيل التحديد عن كل الـ checkboxes أو اضغط "إلغاء الكل" في كل قسم → احفظ. الربط يبقى لكن لا يصل أي إشعار.

### كيف أفصل الربط نهائياً؟
في كرت Telegram اضغط زر **"فصل الربط"** ← أكّد ← يتم حذف الـ chat_id والتفضيلات.

### الكود انتهى قبل ما أستخدمه؟
ارجع لـ console، اضغط "توليد كود ربط" مرة ثانية. كل كود جديد يلغي اللي قبله.

### إيش يحدث لو حذف Modonty البوت؟
يتوقف الإرسال لكل العملاء فوراً. لما يُعاد إنشاء بوت جديد بنفس الـ token (أو token جديد + إعادة ربط)، يرجع كل شي للعمل.

### هل في تكلفة على استخدام Telegram؟
لا. Telegram Bot API **مجاني تماماً** بدون أي حدود معقولة على الاستخدام.

---

## الجدول الزمني المقترح للنشر

| اليوم | المهمة | المسؤول |
|-------|---------|---------|
| 1 | إنشاء بوت من @BotFather + اختبار محلي مع ngrok | Modonty admin |
| 2 | إعداد env vars على Vercel (console + modonty) + setWebhook | Modonty admin |
| 3 | اختبار end-to-end من حساب tester (Kimazone مثلاً) | Modonty admin |
| 4 | إعلان للعملاء + تحديث docs العامة | Modonty admin |
| 5+ | كل عميل يربط حسابه (دقيقتان لكل واحد) | كل عميل |

---

## الملفات ذات العلاقة (للمرجع التقني)

| الملف | الدور |
|--------|------|
| `console/lib/telegram/client.ts` | wrapper لـ Telegram Bot API (sendMessage) |
| `console/lib/telegram/events.ts` | كاتالوج الـ 26 حدث + المجموعات |
| `console/lib/telegram/notify.ts` | event router (يفحص prefs ويرسل) |
| `console/lib/telegram/pairing.ts` | توليد + التحقق من كود الربط |
| `console/app/api/telegram/webhook/route.ts` | webhook receiver |
| `console/app/(dashboard)/dashboard/settings/components/telegram-card.tsx` | كرت الإعدادات |
| `console/app/(dashboard)/dashboard/settings/actions/telegram-actions.ts` | server actions |
| `modonty/lib/telegram/{client,events,notify}.ts` | نسخة modonty لإطلاق الإشعارات |
| `dataLayer/prisma/schema/schema.prisma` | حقول Client: `telegramChatId`, `telegramPairingCode`, `telegramPairingExpiresAt`, `telegramConnectedAt`, `telegramEventPreferences` |

---

## استكشاف الأخطاء

### "TELEGRAM_BOT_TOKEN not configured"
الـ env var غير موجود. تحقق من `.env.local` (محلياً) أو Vercel Dashboard (إنتاج).

### العميل أرسل الكود بس البوت قال "غير صحيح أو منتهي الصلاحية"
- الكود انتهت صلاحيته (10 دقائق فقط) — يولّد كود جديد
- أو الكود اتغيّر لأنه ضغط "توليد كود ربط" مرة ثانية

### الـ webhook لا يستلم رسائل
1. تأكد من `getWebhookInfo` يعيد URL صحيح
2. تأكد console.modonty.com منشور وشغّال
3. تحقق من logs Vercel على endpoint `/api/telegram/webhook`

### اختبار الربط نجح لكن الإشعارات لا تصل
1. تأكد العميل اختار شيء من الـ 26 checkbox
2. تأكد المقال أو الحدث له `clientId` فعلياً (مقالات يتيمة ما يكون لها clientId)
3. راقب الـ logs لرسائل error من `notifyTelegram`
