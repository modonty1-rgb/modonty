# خريطة مسار `/pay` — حزمة `payment`

> **اقرأ هذا أوّلاً، وتحقّق ممّا ستتصرّف على أساسه.** كل سطر هنا ادّعاءٌ كتبه أحدنا،
> لا دليل. الأرقام تحمل تاريخ قياسها؛ وما تنوي تغييره يُقاس من جديد قبل تغييره.

قيست في: **١٤ سبتمبر ٢٠٢٦** (نقل `PAY-S2`).

## لماذا حزمة مستقلّة

كود المدوّنة أوقف صفحة الدفع مرّتين وهي لا تستورده: جرس الإشعارات (`auth()` ← ٦ أخطاء
JWT لكل طلب) و`crypto.getRandomValues()` أثناء التهيئة — كلاهما وصلها عبر
`modonty/app/not-found.tsx` الذي يركّب `SiteShell`، وNext يجهّز ٤٠٤ مع كل مسار.

## الملفّات

| الملفّ | يرسم / يفعل | عميل؟ |
|---|---|---|
| `pay/page.tsx` | `/pay` ← تحويل إلى سوق الزائر (`/pay/sa` محليّاً) | لا |
| `pay/[market]/page.tsx` | صفحة الباقات — `PaySection` المشترك، صفر نصّ بيع في الملفّ | لا |
| `pay/[market]/checkout/page.tsx` | نموذج الطلب + ملخّصه | لا |
| `…/checkout/components/checkout-form/CheckoutForm.tsx` | الحقول · Turnstile · إنشاء الطلب · 3DS | **نعم** |
| `…/checkout/components/card-field/CardField.tsx` | حقل البطاقة (إطار N-Genius) | **نعم** |
| `…/checkout/components/checkout-header/CheckoutHeader.tsx` | ترويسة تركيز: شعار + رجوع | لا |
| `…/checkout/components/order-summary/OrderSummary.tsx` | ملخّص الطلب والضريبة والإجمالي | لا |
| `…/checkout/processing/page.tsx` + `wait-screen/WaitScreen.tsx` | شاشة الانتظار — تسأل الحالة حتى تُحسم | الشاشة نعم |
| `…/checkout/success/page.tsx` · `failed/page.tsx` | النتيجة — تقرأ الطلب وحده | لا |
| `…/checkout/tamara/*` | مسار التقسيط | النموذج نعم |
| `pay/data/get-cached-catalog.ts` | الكتالوج بـ`'use cache'` + وسم `commercial-catalog` | لا |
| `pay/[market]/checkout/helpers/compose-sa-phone.ts` | `5xxxxxxxx` ← `+9665xxxxxxxx` | لا |

نقاط الـAPI موثّقة في `api-checkout.md` و`api-webhooks.md`.

## حقائق مقيسة

| الحقيقة | الدليل | التاريخ |
|---|---|---|
| لا `basePath` — المجلّد `app/pay/**` يُخدَم على `/pay/**` | `payment/next.config.ts` | ١٤ سبتمبر |
| `assetPrefix: "/pay-static"` وNext ينشئ إعادة كتابته تلقائياً في ١٥+ | `load-custom-routes.ts` · `multi-zones.mdx` | ١٤ سبتمبر |
| `cacheComponents: true` **إلزامية** — `'use cache'` و`instant` | سجلّ الإقلاع: `Cache Components enabled` | ١٤ سبتمبر |
| أصول `public` تحت `/pay-static/` وحدها | `curl /pay-static/logos/mada.svg ⇒ 200` | ١٤ سبتمبر |
| الويبهوكان يرفضان بلا توقيع | `POST /api/webhooks/{n-genius,tamara} ⇒ 401` | ١٤ سبتمبر |
| مسار الدفع يستورد من كود مدونتي: **صفر** | جردٌ على ٤٠ ملفّاً | ١٤ سبتمبر |
| حزم خارجية يستوردها المسار: **٩** | نفس الجرد | ١٤ سبتمبر |

## مصائد وقعنا فيها فعلاً

1. **`basePath` كان قراراً خاطئاً.** `<Link>` و`router.push` يضيفانه، و`redirect()` يُضاف
   له عند التصيير، و`<a>` الخام و`fetch` لا. ومسار الدفع يخلط الأربعة — فالسلسلة نفسها
   `/pay/sa` تصحّ في موضع وتخطئ في آخر، في المسار الذي يمرّ منه المال. وتركُه يُبقي
   **عنوان الويبهوك عند المزوّد كما هو**.
2. **`public` لا تُشارَك بين تطبيقَي Next.** الشعارات الثمانية عشر كانت على `/logos` فسقطت
   خلف نطاق مدونتي؛ نزلت تحت `/pay-static/logos`، و`payMarkAsset` أخذ وسيطاً `base`.
3. **`git mv` يرفض الملفّ غير المتتبَّع** («source directory is empty») — ملفّات كُتبت اليوم
   ولم تُكَمَّت. تُنقل بـ`mv` العادي.
4. **ويندوز يقفل المجلّد الذي يراقبه `next dev`** — النقل يفشل بـ`Permission denied` حتى
   يُوقَف الخادم.
