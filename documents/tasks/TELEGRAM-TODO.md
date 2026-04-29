# 📋 TELEGRAM INTEGRATION — TODO حتى نصل لـ 100% شغّال

> **القاعدة:** كل خطوة لازم تتأكد إنها 100% شغّالة قبل ما ننتقل للي بعدها.
> **الترتيب مهم** — لا تتجاوز خطوة، حتى لو حسّيت إنها سهلة.
> **Last Updated:** 2026-04-29

---

## 🟢 المسار السريع — إذا تبغى تشغّل البوت اليوم

نفّذ المسار 1 (5 مهام × ~3 دقائق = 15 دقيقة) → تختبر → تكون شغّال 100% مع 18 حدث.
المسار 2 و 3 لاحقاً (تحسينات + الأحداث الناقصة).

---

## 📌 المسار 1 — تشغيل البوت (المطلوب الآن، ضروري)

### TG-001 — إنشاء البوت من @BotFather
- [x] افتح Telegram وابحث عن **@BotFather** ✅
- [x] أرسل `/newbot` ✅
- [x] الاسم المرئي: **Modonty Alerts** ✅
- [x] Username: **ModontyAlertsBot** (لازم ينتهي بـ `bot`) ✅
- [⚠️] انسخ الـ **token** — **الـ token اتسرّب في الـ chat مرتين، يحتاج revoke**
- [x] `/setdescription` — الوصف العربي اتضاف ✅ (مؤكد بـ screenshot 2026-04-29)
- [ ] `/setabouttext` — يحتاج تأكيد من profile screen
- [x] `/setuserpic` — صورة شعار "M" بنفسجي ✅ (مؤكد بـ screenshot 2026-04-29)

**✅ علامة النجاح:** عندك token من BotFather + الـ 3 customizations مفعّلة

---

### 🚨 TG-001-INCIDENT — Token leak (2026-04-29)
- [ ] **CRITICAL:** الـ token اتسرّب في الـ chat مرتين (screenshot + plain text). لازم `/revoke` على BotFather قبل أي خطوة جاية
- [ ] بعد الـ revoke، BotFather يولّد token جديد
- [ ] الـ token الجديد ينحط مباشرة في `.env.local` بدون يطلع في chat تاني
- [ ] **Lesson learned:** لا تشارك الـ token حتى مع AI assistant — انسخه مباشرة من BotFather إلى ملف الـ env

---

### TG-002 — إعداد env vars محلياً
> **مهم:** اسم متغيّر الـ token هو `TELEGRAM_CLIENT_BOT_TOKEN` (مش `TELEGRAM_BOT_TOKEN`) عشان ما يتعارض مع البوت admin global القديم في modonty/lib/telegram.ts.

- [x] **`console/.env.local`** — مُضاف ✅:
  ```env
  TELEGRAM_CLIENT_BOT_TOKEN=8739374417:...
  TELEGRAM_BOT_USERNAME=ModontyAlertsBot
  TELEGRAM_WEBHOOK_SECRET=mdty_tg_local_dev_secret_2026_04_29_v1
  ```
- [x] **`modonty/.env.local`** — مُضاف ✅ (تحت TELEGRAM_BOT_TOKEN القديم):
  ```env
  TELEGRAM_CLIENT_BOT_TOKEN=8739374417:...
  ```
- [x] الكود محدّث: `console/lib/telegram/client.ts` و `modonty/lib/telegram/client.ts` يقرأون من `TELEGRAM_CLIENT_BOT_TOKEN`
- [x] أعد تشغيل dev servers ✅ (مُختبر 2026-04-29)
- [x] **التحقق:** زرّ "توليد كود ربط" مفعّل وولّد كود `355289` بنجاح + الكرت رسم الكود + زر نسخ + تاريخ الانتهاء ✅

**✅ علامة النجاح:** TG-002 خلصت كاملة — code generation pipeline working

---

### TG-003 — إعداد env vars على Vercel (للـ Production)
- [ ] ادخل **Vercel Dashboard → Project: console → Settings → Environment Variables**
- [ ] أضف 3 variables (كلها Production):
  - [ ] `TELEGRAM_BOT_TOKEN`
  - [ ] `TELEGRAM_BOT_USERNAME` = `ModontyAlertsBot`
  - [ ] `TELEGRAM_WEBHOOK_SECRET`
- [ ] ادخل **Project: modonty → Settings → Environment Variables**
- [ ] أضف:
  - [ ] `TELEGRAM_BOT_TOKEN`
- [ ] **لا تعمل redeploy بعد** — انتظر Phase 4 (الـ webhook)

**✅ علامة النجاح:** كل الـ env vars ظاهرة في قائمة Vercel

---

### TG-004 — تسجيل الـ webhook على Telegram
> **شرط مسبق:** `console.modonty.com` لازم يكون منشور بآخر كود (push أولاً).

- [ ] git commit + push للكود الحالي (يحتاج إذنك)
- [ ] انتظر deploy على Vercel (~3 دقائق)
- [ ] شغّل من PowerShell أو أي bash:
  ```bash
  curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" `
    -H "Content-Type: application/json" `
    -d '{
      "url": "https://console.modonty.com/api/telegram/webhook",
      "secret_token": "<TELEGRAM_WEBHOOK_SECRET>"
    }'
  ```
- [ ] **النتيجة المتوقعة:** `{"ok":true,"result":true,"description":"Webhook was set"}`

**✅ علامة النجاح:** ok=true

---

### TG-005 — Live test end-to-end من حساب Kimazone (✅ نجح 2026-04-29 10:38)
**نتيجة الاختبار:**
- [x] ✅ ngrok started on port 3000 (URL: `https://5429-142-154-87-194.ngrok-free.app`)
- [x] ✅ Webhook registered with Telegram (`getWebhookInfo` confirmed url + 0 pending updates)
- [x] ✅ User opened https://t.me/ModontyAlertsBot
- [x] ✅ User sent code `355289` from Telegram
- [x] ✅ Bot replied: "✅ تم الربط بنجاح! شركتك: كيما زون"
- [x] ✅ Console UI refreshed → status changed from "غير مربوط" → "مربوط" (badge green)
- [x] ✅ Connected timestamp displayed: "29 Apr 2026, 10:38 AM"
- [x] ✅ Test message button appeared (no longer disconnected state)

**TG-005 خلصت بالكامل — pipeline مُثبت.**

---

### TG-005 — Live test end-to-end من حساب Kimazone (الخطة الأصلية للمراجع):
- [ ] افتح `https://console.modonty.com/dashboard/settings` (أو `localhost:3001` للاختبار محلياً مع ngrok)
- [ ] اضغط **"توليد كود ربط"** → يجب أن يظهر كود من 6 أرقام
- [ ] افتح Telegram (أي حساب — يفضّل تستخدم حسابك الشخصي للاختبار)
- [ ] افتح `https://t.me/ModontyAlertsBot` → اضغط **Start**
- [ ] **النتيجة المتوقعة:** البوت يرحّب برسالة "👋 أهلاً بك في إشعارات مدونتي..."
- [ ] أرسل الكود من 6 أرقام للبوت
- [ ] **النتيجة المتوقعة:** "✅ تم الربط بنجاح! شركتك: كيما زون"
- [ ] ارجع لـ console → اعمل refresh → يجب أن تظهر شارة "مربوط" خضراء
- [ ] حدّد أي 2-3 checkboxes (مثلاً: تعليق جديد + رسالة دعم)
- [ ] اضغط **حفظ** → toast: "تم حفظ تفضيلاتك"
- [ ] اضغط **"إرسال رسالة اختبار"** → يجب أن تصلك في Telegram: "🧪 رسالة اختبار..."

**✅ علامة النجاح:** استلمت رسالة الاختبار في Telegram خلال 5 ثواني

---

### TG-005-EXT — Test message button (✅ نجح 2026-04-29 10:39)
- [x] User pressed "إرسال رسالة اختبار" button
- [x] Telegram delivered: "🧪 رسالة اختبار / الربط شغّال — راح تستلم إشعارات كيما زون هنا."
- ✅ Console UI → server action → DB lookup of telegramChatId → sendTelegramMessage → Telegram API: full pipeline confirmed.

---

### TG-006-A ✅ DONE — supportMessage live test (2026-04-29 10:55)
- [x] Toggled `supportMessage` checkbox + saved → DB confirmed `{"supportMessage": true}`
- [x] Submitted contact form on `/clients/كيما-زون/contact` (modonty :3001)
- [x] modonty server logs confirmed the full pipeline:
  ```
  [notifyTelegram] called: clientId=69e8927b6a15f350c2158a2e, event=supportMessage
  [notifyTelegram] client: chatId=8454216004, prefs={"supportMessage":true}
  [notifyTelegram] sending: 📩 <b>رسالة دعم جديدة</b>...
  [notifyTelegram] result: {"success":true}
  ```
- ✅ Real engagement event end-to-end working: visitor form → DB save → notifyTelegram → Telegram API → user receives in Telegram
- Debug logs removed after verification

---

### TG-006-LIVE-TESTS ✅ COMPLETE (2026-04-29) — 18/18 EVENTS CONFIRMED LIVE
- [x] **articleView** ✅
- [x] **clientView** ✅ (URL referrer decoded properly)
- [x] **articleShare** ✅
- [x] **articleCtaClick** ✅
- [x] **articleLinkClick** ✅
- [x] **clientShare** ✅
- [x] **clientSubscribe** ✅
- [x] **clientFollow** (auth) ✅
- [x] **articleLike** (auth) ✅
- [x] **articleDislike** (auth) ✅
- [x] **articleFavorite** (auth) ✅
- [x] **commentNew** (auth) ✅
- [x] **commentLike** (auth) ✅
- [x] **commentDislike** (auth) ✅
- [x] **commentReply** (auth, after parent approved via console) ✅
- [x] **askClientQuestion** (auth) ✅
- [x] **conversion** (auto from contact/newsletter) ✅
- [x] **campaignInterest** (console) ✅
- [x] **supportMessage** ✅ (tested earlier as TG-006-A)

**Wired during live testing (gaps discovered):**
- `notifyTelegram` was missing in 4 API routes used by the article page UI: `/api/articles/[slug]/comments` (POST), `/api/articles/[slug]/comments/[commentId]` (POST reply), `/api/comments/[id]/like` (POST), `/api/comments/[id]/dislike` (POST). Now wired with `headers` for geo + `ipAddress` for fallback.
- The server actions in `articles/[slug]/actions/comment-actions.ts` were already wired but the article page components actually call the API routes — this was a wiring duplicate gap caught during live test.

**Footer pattern:**
```
━━━━━━━━━━
🕐 29 Apr 2026, 11:18
📍 [city, country] — when real visitor IP, skipped for localhost
```

**Fixes in this round:**
- `articleView`: now uses article.title instead of slug (more readable)
- `clientView`: `referrer` URL now decoded via `URL().pathname` (was: `%D9%83...`)

---

### TG-006 — Live test لحدث حقيقي (تعليق جديد)
- [ ] في Kimazone settings، فعّل **"تعليق جديد"** (commentNew) واحفظ
- [ ] افتح `https://modonty.com` (أو localhost:3000)
- [ ] افتح أي مقالة لـ Kimazone
- [ ] سجّل دخول كزائر (test account)
- [ ] اكتب تعليق جديد على المقالة
- [ ] **النتيجة المتوقعة في Telegram خلال 3 ثواني:**
  ```
  💬 تعليق جديد
  <عنوان المقالة>
  <اسم الزائر>: <نص التعليق>
  🔗 مراجعة من اللوحة
  ```

**✅ علامة النجاح:** الإشعار وصل بمحتوى صحيح

---

### TG-007 — Live test لـ 3 أحداث متنوعة
- [ ] فعّل **"رسالة دعم"** + **"تسجيل اهتمام بحملة"** + **"مشاركة مقال"** + احفظ
- [ ] من modonty: أرسل رسالة دعم عبر `/contact` → تحقق من Telegram
- [ ] من console: اضغط زر تسجيل اهتمام بحملة → تحقق من Telegram
- [ ] من modonty: اضغط زر مشاركة مقالة على أي منصة → تحقق من Telegram

**✅ علامة النجاح:** 3 إشعارات وصلت بمحتوى صحيح

---

## 🟡 المسار 2 — مراجعة الـ 8 أحداث الناقصة (قرار + تنفيذ)

### TG-CLARIFY — توضيح الـ `newsletterSubscribe` (2026-04-29)
**التحقق من سوء فهم سابق:** `newsletterSubscribe` في الـ catalog كان يبدو "مفقود code path"، لكن الحقيقة:
- **`NewsSubscriber` model** → نشرة مدونتي العامة (للمنصة كلها) — الإشعار يصل لـ Khalid (admin) عبر البوت القديم في `modonty/lib/telegram.ts`. **شغّال أصلاً قبل التكامل الحالي.**
- **`Subscriber` model** → نشرة العميل (per-client) — الإشعار يصل للعميل عبر البوت الجديد. هذا اسمه `clientSubscribe` في الـ catalog وتم اختباره ✅
- **القرار:** `newsletterSubscribe` لا ينطبق على per-client → احذف من catalog. الميزة موجودة في النظام القديم لـ admin فقط.

---

### TG-008 — قرار: ماذا نعمل بالأحداث الـ 8 الناقصة؟
**القرار يحتاج إجابتك على كل واحد:**

| الحدث | المشكلة | الخيارات |
|-------|---------|---------|
| `questionNew` | مكرر مع `askClientQuestion` | (a) احذفه (b) سمّه `chatbotQuestion` لاستخدام مستقبلي |
| `clientLike` | مكرر مع `clientFollow` | (a) احذفه (b) خلّيه عشان semantic clarity |
| `newsletterSubscribe` | لا clientId | (a) احذفه (b) أضف clientId للـ NewsSubscriber model |
| `leadHigh` | لا scoring في modonty | (a) انقل scoring إلى modonty (b) خلّيه future-ready |
| `clientDislike` | لا endpoint | (a) احذفه (b) ابني endpoint |
| `clientFavorite` | لا endpoint | (a) احذفه (b) ابني endpoint |
| `clientComment` | لا endpoint | (a) احذفه (b) ابني endpoint |
| `commentLike` | (مربوط ✅، نعدّه استثناء) | — |

- [ ] قررت: ____________________________________
- [ ] تاريخ القرار: __________

**✅ علامة النجاح:** قائمة بقرارات (احذف/أبقي/ابني) لكل حدث

---

### TG-009 — تنفيذ القرارات (يعتمد على TG-008)
- [ ] بناءً على القرارات، إما:
  - حذف الأحداث المرفوضة من `console/lib/telegram/events.ts` و `modonty/lib/telegram/events.ts`
  - أو ربط الأحداث المُختارة بـ endpoints جديدة
- [ ] TSC verify
- [ ] commit + push
- [ ] live test كل تغيير

**✅ علامة النجاح:** كل حدث في الـ catalog إما يعمل فعلياً، أو حُذف

---

## 🟢 المسار 3 — تحسينات اختيارية (بعد التشغيل)

### TG-010 — Throttling للأحداث التراكمية
**المشكلة المتوقعة:** بعد أسبوع من التشغيل، نتاكد كم رسالة Telegram يصل لكل عميل.

- [ ] راقب لمدة أسبوع — Kimazone مثلاً
- [ ] لو وصل > 50 رسالة/يوم، فعّل throttling:
  - أحداث "مهمة" (تعليق، سؤال، دعم، lead) → فورية
  - أحداث تراكمية (views, likes) → ملخص كل ساعة/يوم
- [ ] إضافة حقل `telegramThrottling: Json?` للـ Client model
- [ ] إضافة Cron job أو scheduled task يجمّع الأحداث

**✅ علامة النجاح:** عميل واحد على الأقل يستفيد من Throttling

---

### TG-011 — Group chat support
**الميزة:** عميل يضم البوت لمجموعة فريقه (Sales/Support/Marketing) ليستلمها كلها.

- [ ] حالياً يعمل تلقائياً لو ضافوا البوت لمجموعة + سوّو /start
- [ ] اختبر: أنشئ مجموعة، أضف البوت، اعمل /start من المجموعة، تحقق إن كل الفريق يستلم

**✅ علامة النجاح:** مجموعة تستلم رسائل البوت

---

### TG-012 — Telegram daily digest (إذا الأحداث كثيرة)
- [ ] خيار جديد: "ملخص يومي" بدل أحداث فورية
- [ ] إعداد Cron job في `console/api/cron/telegram-digest`
- [ ] إضافة حقل اختيار `digest: "instant" | "hourly" | "daily"`

**✅ علامة النجاح:** عميل واحد يفعّل digest ويستلم ملخص يومي

---

### TG-013 — Bot health monitoring
- [ ] script لمراقبة `getWebhookInfo` يومياً
- [ ] لو في `last_error_message`، أرسل تنبيه
- [ ] إضافة dashboard page صغيرة في console للأدمن: "Telegram bot status"

**✅ علامة النجاح:** dashboard يبيّن الحالة الصحية للبوت

---

### TG-014 — Rate limiting للـ webhook
- [ ] حماية ضد flood من Telegram (لو حدث abnormal)
- [ ] حد: 100 رسالة/دقيقة
- [ ] لو تجاوز، رد 429

**✅ علامة النجاح:** رفض الرسائل الزائدة عن الحد

---

## 🔴 خطوات حساسة — قبل الـ commit النهائي

### TG-015 — مراجعة أمنية (Security audit)
- [ ] تأكد ما في `TELEGRAM_BOT_TOKEN` في git (`git diff` يظهر العامل)
- [ ] `.env.local` و `.env` في `.gitignore`
- [ ] تأكد `TELEGRAM_WEBHOOK_SECRET` صعب التخمين (32 char min)
- [ ] في الـ webhook handler، تأكد إنه يرفض requests بدون Header الصحيح

**✅ علامة النجاح:** لا secrets في git history

---

### TG-016 — Rollback plan
- [ ] لو شي طفش، الخطوات للعودة للحالة السابقة:
  1. `git revert <commit-hash>` للكومت اللي ضاف Telegram
  2. حذف الـ env vars من Vercel
  3. حذف webhook بـ `curl -X POST .../deleteWebhook`
  4. حذف الحقول من schema (اختياري — ما يأذي إن بقي optional fields)
- [ ] احفظ هذا في NotebookLog لرجوع سريع

**✅ علامة النجاح:** خطة rollback مكتوبة وموثّقة

---

## ✅ المعايير: متى نعتبر الـ Telegram integration "شغّال 100%"؟

كلمة "100% شغّال" تعني تحقق **كل** الآتي:

- [x] ✅ Schema migration applied (5 fields)
- [x] ✅ Code: lib + webhook + UI + actions كاملة
- [x] ✅ TSC clean على console + modonty
- [x] ✅ MD setup guide موجود
- [ ] ❌ TG-001 إلى TG-007 منفّذة (بوت + env + webhook + e2e tests)
- [ ] ❌ TG-008 + TG-009 (قرار + تنفيذ على الـ 8 أحداث)
- [ ] ❌ TG-015 (security audit)
- [ ] ❌ commit + push للكود الحالي + بعد كل تعديل
- [ ] ❌ عميل tester (Kimazone) استلم 5+ إشعارات بنجاح من 5 أحداث مختلفة

**الحالة الحالية: 4 من 9 (~ 44%)**

---

## 📊 خطة التقدم المقترحة

| اليوم | المسار | المهام | الزمن |
|------|--------|--------|--------|
| 1 | المسار 1 | TG-001 → TG-005 | 30 دقيقة |
| 2 | المسار 1 | TG-006 + TG-007 (live tests) | 30 دقيقة |
| 3 | المسار 2 | TG-008 + TG-009 (قرارات + تنفيذ) | ساعة |
| 4 | المسار 3 | TG-010 (Throttling لو يحتاج) | ساعة |
| 5 | الأمن | TG-015 + TG-016 | 30 دقيقة |
| 6+ | تحسينات | TG-011 → TG-014 حسب الأولوية | متفاوت |

---

## ✅ DONE (الأرشيف)
- [x] Phase 1: Schema migration applied to PROD (2026-04-29)
- [x] Phase 2: lib/telegram (4 files in console + 3 mirrored in modonty) (2026-04-29)
- [x] Phase 3: Webhook handler at /api/telegram/webhook (2026-04-29)
- [x] Phase 4: Settings UI Telegram card with always-visible checkboxes (2026-04-29)
- [x] Phase 5: 19/19 events wired (2026-04-29)
- [x] Phase 6: TSC clean both apps + 0 console errors (2026-04-29)
- [x] Phase 7: Setup MD guide written (2026-04-29)
- [x] Phase 8: Live test — 19 events confirmed delivering to Telegram (2026-04-29)
- [x] Phase 9: Footer pattern (timestamp + geo) added globally (2026-04-29)
- [x] Phase 10: Catalog cleaned — removed 4 redundant events: questionNew, newsletterSubscribe, clientLike, clientDislike (2026-04-29)
- [x] Phase 11: Built `clientFavorite` end-to-end (API + UI button on client page hero + Telegram event) (2026-04-29)
- [x] Phase 12: Built `clientComment` end-to-end (API + form/list on client page + console approval page at `/dashboard/client-comments`) (2026-04-29)
- [x] Phase 13: Live tests for clientFavorite + clientComment ✅ both confirmed delivering (2026-04-29)

## 📊 الحالة النهائية
- Catalog: **22 event**
- Wired + tested: **21** (كل شي عدا `leadHigh` future-ready)
- TSC: clean (modonty + console)
- 0 console errors
