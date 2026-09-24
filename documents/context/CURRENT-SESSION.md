# الجلسة الحاليّة

**٢٣–٢٤ سبتمبر ٢٠٢٦ — مصدرٌ واحد للمال والاشتراكات والباقات في كلّ التطبيقات · الطلبات بالعميل · تقرير الفريق وإسناد المهامّ**

## وقفنا عند

مراجعة `documents/HTML/GA4-BOARD.html` (تقرير التتبّع، ٣ سبتمبر) مقابل الكود الحاليّ — قُطعت
في منتصفها. **الخطوة التالية:** إكمال التقرير لخالد: ما صُلح وما بقي من بنوده.
مقيس حتى الآن (للقراءة فقط): توحيد الهويّة **لم يُنفَّذ** (`modonty/lib/analytics/visitor-cookie.ts:35`
ما زال يفكّ `_ga` بـregex، ولا جسر `mdy_ga`، ولا صفّ انتظار في `WebVitals.tsx`) · الأسماء
الرسميّة (`sign_up`/`login`/`search`) **لم تُنفَّذ** · `/users/register` **بلا h1** (كوداً وإنتاجاً) ·
`/reels` صار فيه h1 · على الإنتاج: `gtag` غير معرَّف، و`fbq/ttq/snaptr` غير محمّلة، وdataLayer
فيه `gtm.dom/gtm.load` فقط. لا commits على `lib/analytics` منذ ٣ سبتمبر.
خالد كان يبحث عن تقريرٍ آخر («تقرير العميل في الكونسول من GA4 حسب الدولة والمقال») — لم
يوجد في المستودع ولا الـArtifacts ولا الجلسات المحفوظة (تبدأ ١٢ سبتمبر). عُرض عليه كتابتُه.

## الحالة التقنيّة

| | |
|---|---|
| الفرع · آخر كوميت | `main` · `5caf380` (١٣٢ ملفّاً) — مرفوع |
| غير مثبَّت | لا شيء |
| tsc | admin 0 · console 0 · modonty 0 · payment 0 — قيس قبل الدفع |
| Vercel | الأربعة `success` على `5caf380` (payment 20:52 · modonty 20:54 · console 20:55 · admin 20:57) — قيس |
| دخان الإنتاج | modonty `/` و`/story` · pay `/sa` («٣٩٩ ر.س.») و`/sa/contract` = 200 — قيس. أدمن/كونسول الإنتاج لم يُفحصا |

## ما أُنجز (مرفوع في `5caf380`)

- **المال = الطلبات المدفوعة وحدها**: `admin/lib/orders/revenue-order.ts` (REVENUE_ORDER) ·
  `shared/lib/payments/collected.ts` (isCollectedOrder · isOutstandingInvoice · outstandingByCurrency)؛
  الفاتورة مستند. تقرير المبيعات = صفحة الطلبات (مصر ١١٥٬١٠٦).
- **الاشتراك من الطلب الساري**: `shared/lib/subscription/subscription-term.ts` ·
  `admin/lib/subscription/get-client-subscriptions.ts` · `console/lib/subscription/get-client-subscription.ts`.
  منتهٍ ١١ · يقترب ٣ — مطابق لحسابٍ مستقلّ.
- **حالة الفاتورة enum** `InvoicePaymentStatus {PAID, DUE}` في السكيما + `shared/lib/payments/invoice-status-label.ts`.
  نسخة الإنتاج: كلّ الفواتير `PAID` (١٦).
- **كلمات حالة الطلب** نُقلت إلى `admin/lib/orders/order-status-copy.ts`.
- **رمز العملة واحد بالنقطة** `currencyLabel` في `shared/lib/commercial/format-money.ts` («ر.س.»/«ج.م.»)؛
  المدّة `shared/lib/commercial/term-label.ts` (formatTermLabel).
- **الطلبات**: جدول رئيسيّ بالعميل + فرعيّ، فلاتر في منيو، إجماليّات بجانب الفلاتر، تعديل الطلب
  (حساب لنا · تواريخ · أوّل مقال للمرحَّل فقط)، زرّ التجديد على الطلب الساري وحده، «المستلم».
- **الكونسول**: المدفوع من الطلبات، شارة الدفع قاعدة واحدة (`console/lib/payments/`)، «عليك مستحقّات»،
  الشريط يقول «مدفوع» كالإعدادات.
- **الكتالوج**: العملاء المحتملون · /story (`story-offer.ts`) · دليل الفريق
  (`admin/app/(public)/playbook/helpers/get-playbook-catalog-copy.ts` · `admin/lib/pricing/get-featured-plan-*.ts`
  — الباقة المميَّزة بدل سلَق `zakham`) · العقد يذكر الضريبة للسعوديّة فقط.
- **المهامّ**: `/tasks/assign` (Assign Task) · `/daily-tasks` تقرير أسبوعيّ (Team Report) ·
  `admin/components/tasks/task-dialog.tsx` عربيّة: الزميل قائمة منسدلة في الترويسة · `admin/components/ui/dialog.tsx`
  زرّ الإغلاق `end-4` والترويسة `sm:text-start` (يصلح كلّ النوافذ العربيّة).
- **حُذفت** (بلا مستورِد): `get-plans` · `get-tier-labels` · `shared/lib/pricing-durations` ·
  `advance-referral-on-payment` · `console/lib/subscription/term-label`.

## قرارات فاعلة

- المال = طلبٌ PAID؛ الفاتورة مستند؛ المستحقّ = فاتورة غير مدفوعة، لكلّ عملةٍ وحدها.
- المنتهي يبقى ظاهراً على مدونتي ولا يُكتب له مقال (الإنشاء يُرفض لغير ACTIVE).
- `Client.subscriptionStatus` باقٍ مفتاحَ ظهورٍ يدويّ فقط (CANCELLED).
- /story نصٌّ مكتوب يدويّاً بقرار خالد (التسجيل الصوتيّ يقول ١٢←١٨).
- سلَق الباقات في الإنتاج هاش (`plan-f1854bef`)؛ **لا يُغيَّر** الآن (يكسر روابط `?plan=` القديمة).
- لا بيانات إنتاج تُمسّ؛ `admin/.env.local` فيه `PROD_SYNC_DATABASE_URL` (للقراءة، مُتجاهَل في git).

## مفتوح

- **ذكّر خالد:** نقاش معرض Techne الإسكندريّة ٣–٥ أكتوبر (مؤجَّل بطلبه).
- دار التعافي: الطلب ١٬٥٠٠ مقابل الفاتورة ٣٬٥٩٧ — خالد يراجع بالإكسل.
- بيانات اختبار على `modonty_dev`: مهامّ «تجربة…» (٤)، كلمة سمايل تاون `Local-Check-2026!`
  (بريد `mohamedsheno96@gmail.com`)، حساب `claude-check@modonty.local`.
- دخول الكونسول يُسقط جلسة الأدمن محلّيّاً (كوكي مشترك) — متوقّع.
- `admin/scripts/seed-orders-for-clients.ts` يتطلّب الآن `--market=SA|EG`.
- سيرفر الدفع المحلّيّ على 3003 شُغّل في هذه الجلسة.

## مؤجَّلٌ بقرار خالد

تدويرُ كلمة مرور قاعدة الإنتاج · النيوزليتر · `contentPriorities` · ترقية Flex → M10 · كبحُ الزواحف.
