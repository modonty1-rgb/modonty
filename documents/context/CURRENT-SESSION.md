# الجلسة الحالية — ١٥ سبتمبر ٢٠٢٦

**الموضوع:** مسح نهائي لواجهة البيمنت، رفع، لايف تست على الإنتاج، وتنسيق بيكسلات التتبّع.

---

## أين توقّف العمل — والخطوة التالية

**توقّف عند:** خالد ينتظر جواب سؤالين قبل أي كود جديد:
1. **حاوية GTM** — مشتركة مع مدونتي (`GTM-MNRR2NS9`) أم مستقلّة للبيمنت؟ (توصيتي: مستقلّة).
2. **معرّفات البيكسلات والتوكنات** من الميديا باير — بدونها لا يُركَّب شيء.

**الخطوة التالية بعد وصولهما:** تركيب `GTMContainer` في تخطيط البيمنت (النمط جاهز في
`modonty/app/layout/components/gtm/GTMContainer.tsx`، والمُحلّل المشترك
`shared/lib/gtm/getGTMSettings.ts` يقرأ `NEXT_PUBLIC_GTM_CONTAINER_ID`)، ثم دفع حدث
`purchase` إلى dataLayer في صفحة النجاح، ثم CAPI من السيرفر بنفس `event_id`.

⚠ اسم الـdataLayer في نمط مدونتي هو `shared` لا `dataLayer`.

## ما أُنجز — مُودَع ومدفوع

`42e9dae` · `fd9f0c8` على `main`. غير مُودَع: `documents/tasks/PAYMENT-PIXELS-BRIEF.html` فقط.

- **بطاقة المشاركة**: كانت صفر وسوم OG ⇒ رابط الإعلان يُرسَم عارياً. أُضيفت
  `openGraph`+`twitter`+`metadataBase`، و`payment/public/og.png` ١٢٠٠×٦٣٠
  (مصدرها `documents/assets/og-card.html`).
- **`robots.txt`**: `Disallow: /` كان يحجب بوتات المعاينة فتُكسر البطاقة. استُثنيت على
  صفحتَي التسويق وحدهما. (جوجل أدز لم يكن متأثّراً: `AdsBot-Google` يتجاهل `*`.)
- **توكنات الحبر** `--destructive-ink`/`--success-ink`/`--star-ink` (إضافة محضة في
  `modonty/app/globals.css`) + `--success-foreground` أبيض ⇒ نيليّ (كان ٢٫١٠:١).
- **`.gitignore`**: `*.png` الشامل كان يُسقط `og.png` و`sadad.png` و`saib-bank.png` —
  والأخير يُرسم حيّاً. أُضيف `!payment/public/**/*.png`.
- **`frame-ancestors 'none'`** في `payment/next.config.ts`: صفحة البطاقة كانت تُؤطَّر
  في أي موقع. (لا `X-Frame-Options: DENY` — يكسر إطار 3DS.)
- **تنظيف**: ٢٣ سكربت `_*.mjs` من جذر `payment/` · `boomtest/`+`_boomtest/` ·
  ٣٨ لقطة من جذر المستودع · ملفٌّ متعقَّب باسمٍ مشوّه. الجذر ٥٣ ⇒ ٩ ملفّات.
  ونُقل `nextjs.yml` و`seo-devnadish-lines.json` إلى `documents/attic/`.

## اللايف تست — ناتج خام

**سليم:** ٢٤ لقطة حيّة (٤ صفحات × ٣ عروض × وضعين) = صفر عطل · `og.png` **200** ·
`wa.me/966541018020` في HTML الحيّ · `POST /api/revalidate/tag` بلا سرّ = **401** ·
HSTS و`Referrer-Policy` و`nosniff` و`Permissions-Policy`.

**معطوب على الإنتاج:**
- **إنجينيس ساندبوكس**: إطار الدفع = `paypage.sandbox.ksa.ngenius-payments.com`.
- **تيرنستايل مفتوح**: `turnstileToken:"dummy-token-for-probe"` ⇒ **502 ngenius-failed**
  بدل **403 bot-check-failed**. و`data-sitekey: null` فالودجت لا يُرسم.
- **سقف المعدّل معطّل**: ٧٠ طلباً على `/api/checkout/status` ⇒ ٧٠×**404** وصفر **429**.
- **لا تنبيه للطلبات**: `admin/lib/notifications/registry.ts:30-49` يحمل ثلاثة أحداث
  فقط (`contact_reply` · `campaign_interest` · `faq_reply`).

## دَينٌ عليّ — أنشأتُ بيانات على الإنتاج

جسّي للـAPI مرّ من تيرنستايل المفتوح، و`create-payment/route.ts:145` يُنشئ الطلب **قبل**
نداء البوّابة (`:188`) — فصار صفّ `CheckoutOrder` + `PaymentAttempt` وهميّ:
`sessionId: livecheck-0000000001` · `email: t@example.com` · `name: فحص حيّ`.
**لم يُحذف** — خالد لم يجب على عرض الحذف.

## يحتاج قراره

1. حاوية GTM: مشتركة أم مستقلّة.
2. حذف الصفّ الوهمي أعلاه.
3. تنبيه الطلبات: تيليجرام/بريد أم متابعة يدوية.
4. رقم الشراكات للتذييل · محتوى مصر (ضريبة ١٤٪) · رأس المال `8,000,000 ر.س`.

## للإنتاج (فيرسال) — لم يُنفَّذ

مفاتيح **Turnstile** الحقيقية · مفاتيح **Upstash** · `NEXT_PUBLIC_GTM_CONTAINER_ID`.
(`NEXT_PUBLIC_SALES_WHATSAPP` و`REVALIDATE_SECRET` متحقَّقان حيّاً — مضبوطان.)

## حالة البناء

`tsc` **صفر أخطاء** في `payment` و`admin` و`modonty` (شُغّل هذه الجلسة).
البناء والنشر: نجح — `fd9f0c8` حيٌّ على `pay.modonty.com`.
