# الدفع — N-Genius الحي + تمارا

**٥ أكتوبر ٢٠٢٦** · حزمة `payment/` (pay.modonty.com) + زرّ الاسترداد في `admin/`.

## وقفنا عند

الكود جاهز محلياً وغير مرفوع. ننتظر: اعتماد ويبهوك N-Genius الحي · اعتماد تمارا للاختبار ومفاتيح الإنتاج.
خالد يرسل إيميلين (N-Genius لاعتماد الويبهوك · تمارا للمفاتيح وتحويل الحساب إلى khalid@modonty.com).

**الخطوة الجاية الواحدة:** بعد ٧ مساءً وبأمر خالد بالنشر ← رفع تعديلات payment + admin، ثم البنود الثلاثة تحت «بعد النشر».

## بعد النشر (بالترتيب)

1. منطقة دوال مشروع Vercel `modonty-payment` ← `fra1` (الآن `functionDefaultRegions: ["iad1"]`). السبب: قاعدة الإنتاج `tgixa8h` على IP في فرانكفورت (مؤشّر من geo-IP لا من Atlas) + قياس البنك. `preferredRegion` في الكود بلا أثر (Next 16.3.4 docs: deprecated).
2. `PAYMENT_INTERNAL_SECRET` على Vercel للمشروعين (payment + admin)، و`PAY_INTERNAL_URL=https://pay.modonty.com` للأدمن. القيمة في `payment/.env.local` و`admin/.env.local`.
3. إعادة نشر modonty-payment ← قيم N-Genius الحية تعمل (موضوعة على Production، لا أثر قبل النشر). ثم فحص: صفحة الدفع تحمّل SDK الحي، ويبهوك يردّ 400 بلا رقم طلب.
4. بعد مفاتيح تمارا الإنتاج: قيمها على Vercel Production + تسجيل ويبهوك إنتاج عبر `POST /webhooks` (الأحداث السبعة).
5. أول عملية حقيقية بأقلّ مبلغ ثم استرداد.

## المنجز اليوم

**N-Genius الحي (MID 901000900387):**
- مفتاحان في البوابة الحية (لا يُعدَّلان ولا يُحذفان): `modonty-pay-server` (Merchant) · `modonty-pay-hosted-session`.
- Outlet: `7f8ef809-2b02-456b-a3fa-b10b6bf553d5`.
- ويبهوك `modonty-pay-live` ← `https://pay.modonty.com/api/webhooks/n-genius` · ترويسة `x-ngenius-webhook-secret` — ينتظر اعتمادهم.
- القيم الحية في `payment/.env.live.local` (git-ignored). `.env.local` يبقى ساندبوكس.
- Vercel Production لمشروع modonty-payment: ٧ قيم محدَّثة + `NEXT_PUBLIC_NGENIUS_SDK_URL` أُنشئ (كان غائباً). Preview بقي ساندبوكس.
- قياس المناطق (مشروع مؤقت حُذف): ساندبوكس GET order يعلّق من iad1 فقط؛ fra1/bom1 تعمل؛ الحي يردّ من iad1 (على طلب غير موجود).

**تمارا (ساندبوكس، merchant `ef2eab45-…`):**
- المفاتيح في `payment/.env.local`. ويبهوك ساندبوكس `f648989a-4efd-4721-b83c-a5b0d3c66b37` يشير مؤقتاً إلى ngrok.
- قائمة إطلاقهم مقيسة على modonty_dev: ORD-61/62 مُسترَد · ORD-63 مرفوض · ORD-64 ألغاه العميل (expired) · ORD-65 مدفوع `fully_captured` 2394. كلها `[QA TEST]`.
- الإلغاء عبر API غير مطلوب (نقبض فور التفويض — «not applicable if Auto-capture»).

## الملفات المعدَّلة (غير مرفوعة)

- `payment/app/api/webhooks/tamara/route.ts` — إصلاح: إشعار رابط الطلب يحمل `order_status` لا `event_type` (كان كل حدث لاحق يُسقَط مكرَّراً) · `settledAt` لا يُمحى عند الاسترداد.
- `payment/lib/tamara/orders.ts` — `refundOrder` (simplified-refund).
- `payment/app/api/internal/tamara-refund/route.ts` — جديد، بسرّ داخلي، المبلغ من `captured_amount` عند تمارا.
- `payment/app/[market]/checkout/tamara/page.tsx` + `components/tamara-widget/TamaraWidget.tsx` — ويدجت تمارا الرسمي.
- `payment/lib/checkout/resolve-checkout-reason.ts` — حذف جملة مكرّرة في رسالة الإلغاء.
- `admin/lib/payments/refund-tamara-order.ts` — جديد (النقل إلى `lib/orders/` رُفض بالصلاحيات).
- `admin/app/(dashboard)/orders/actions/refund-order.ts` · `components/refund-order-button.tsx` · `[id]/page.tsx` — طلب تمارا يُردّ عبر تمارا أوّلاً، ونصّ الحوار يقولها.
- `documents/tasks/task-data.json` — بطاقات PAY-D1 · PAY-POLL · PAY-TAMARA.

## قرارات وموانع

- لا نشر قبل ٧ مساءً وبلا أمر صريح (آخر يوم Techne).
- قيم مالية من عندي لا تُكتب في إيميلات الشركات (خالد رفض بند min/max).
- الويبهوك نسجّله نحن لتمارا عبر API — لا يُطلب منهم.
- ملفات مؤقتة لم تُحذف (الصلاحية رُفضت): `scratch/ngenius-probe/` · `.playwright-mcp/probe-*`.

## Git والحالة

- فرع `main` · آخر كوميت `3aa3211` · التعديلات أعلاه غير مودَعة (ومعها شغل جلسات أخرى — لا إيداع جماعي).
- tsc: payment EXIT 0 · admin خطآن في `articles-board.tsx` فقط (شغل جلسة أخرى).
- شغّال الآن: payment dev على 3003 (`PAY_PUBLIC_URL` = ngrok) · ngrok `florist-distinct-educator.ngrok-free.dev`.
- الإنتاج: لم يُنشر شيء من هذه الجلسة.
