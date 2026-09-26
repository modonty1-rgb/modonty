# الجلسة الحاليّة

**٢٤ سبتمبر ٢٠٢٦ — هياكل مدونتي · اختيارات الرئيسية · Clients Articles · تصنيفات فرعيّة · حقل كلمة المرور**

## وقفنا عند

الدفعة كلّها مرفوعة ومنشورة. لا تاسك مفتوح في يد العمل. **الخطوة التالية:** ما يختاره خالد —
أقربُ المرشَّحات: فحصُ `/categories/[slug]` لتصنيفٍ رئيسيّ (هل يجلب مقالات فروعه؟ لم يُفحص).

## الحالة التقنيّة

| | |
|---|---|
| الفرع · آخر كوميت | `main` · `f260bd8` — مرفوع |
| غير مثبَّت | لا شيء من شغل الجلسة |
| tsc | admin 0 · modonty 0 · console 0 — قيس قبل الدفع |
| Vercel | الأربعة `success` على `f260bd8` — قيس |
| دخان الإنتاج | مدونتي `/` `/articles` `?category=` `/help/faq` `/categories` `/legal/privacy-policy` `/story` = 200 — قيس. لم يُفتح شيء بصريّاً على الإنتاج، ولا الأدمن |

## ما أُنجز (مرفوع في `f260bd8`)

- **هياكل مدونتي**: loading.tsx للأمّ يغطّي أبناءها (وثيقة Next) → ١٠ صفحات أمّ نُقلت إلى `(index)`
  (articles · categories · tags · industries · help · legal · news · users/profile · reels · clients/[slug]).
  صُحّحت: المقالات ٣ أعمدة · المجالات (`industries/components/industries-skeleton`) · القصّة
  (`story/StorySkeleton.tsx`) · الاستماع · التحليلات ٥ · الكاتب · المساعدة · الأسئلة · التواصل ·
  صفحات الشريك (`clients/[slug]/components/page-frame-skeleton.tsx`). القانونيّة الخمس:
  `modonty/components/shared/legal-page-skeleton` لـloading وfallback معاً (حُذفت ٥ ملفّات fallback).
- **PageFrame الشريك**: الفتات والعنوان داخل `max-w-[1128px] px-6` (كانا على حافّة الشاشة).
- **التصنيفات الفرعيّة**: `modonty/lib/articles/archive/get-articles-filters.ts` شجرة (عدد الأب يشمل فروعه) ·
  `get-articles-archive.ts` الأبُ يجلب فروعه · الرفّ مُزاح · الشرائح تفتح الفروع بعد اختيار الأب.
  dev: ترند مدونتي ٣٤ = ٢٩ + سوالف ٥.
- **اختيارات الرئيسية**: `featuredOrder` في السكيما · `shared/lib/articles/homepage-article-order.ts`
  (الترتيب · الحدّ ١٠) · لوحة الأدمن `/articles/homepage` · إبطال فوريّ (`immediate` → expire 0).
- **Clients Articles** `/articles/clients-guide` (السايدبار تحت Articles): DataTable · KpiToggle فلاتر ·
  CountTab للباقات في سطر العنوان · كلّ الأرقام من الطلب الساري؛ `admin/lib/orders/articles-agreed.ts`
  و`delivered-articles-where.ts` يقرؤهما كرت الطلب أيضاً. «Awaiting» = `AWAITING_APPROVAL`.
- **DataTable**: سهمُ فرزٍ ظاهر (يسري على كلّ جداول الأدمن).
- **كلمة مرور العميل**: `edit-workspace/password-field.tsx` (عين ونسخ داخل الحقل · توليد في سطر العنوان) ·
  حدٌّ أدنى ٦ من `shared/lib/constants/client-password.ts` (نموذج الأدمن · الترحيب · الكونسول).

## قرارات فاعلة

- مصدرٌ واحد: أرقام الحصّة في Clients Articles من الطلب الساري (مجمَّدة يوم الشراء)؛ وسوم الباقات
  فوق الجدول من تعريف الباقة (`CommercialPlan`). لا مقارنة بينهما في الجدول (خالد رفضها).
- جداول الأدمن: DataTable + صفّ 40px + إنجليزيّة + بولد للمهمّ فقط (`.claude/skills/admin-entity-standard`).
- الشغل يُجمَع ويُرفع دفعةً واحدة على `push>` (خالد).

## مفتوح

- **ذكّر خالد:** نقاش معرض Techne الإسكندريّة ٣–٥ أكتوبر.
- طلبات dev بحصصٍ غريبة (لم يُتحقّق مقصودة أم خطأ): ٥/شهر (عمرو مصطفى · MBC clinic) · ٩ (هابي سمايل) ·
  ٠ (ORD-2026-00014 سمايل تاون). ١٩ من ٤٣ عقداً على رقمٍ غير رقم باقته اليوم.
- الاسمان المتشابهان في السايدبار: «Clients Articles» و«Client Articles» — سُئل خالد، لم يجب.
- عمود الوسط في رئيسية مدونتي أعرض من صندوقه بـ٣٧px (خلل صفحة لا هيكل) — لم يُصلح.
- فروقٌ صغيرة لم تُلمس: هيكل المتجر (٣ مقابل ٢) · ارتفاع بطل الوسم · الفريق · الريلز.
- `admin/articles/loading.tsx` يغطّي كلّ `/articles/*` في الأدمن (نفس علّة مدونتي) — لكلّ صفحةٍ جديدة loading خاصّ.
- دار التعافي: ١٬٥٠٠ مقابل ٣٬٥٩٧ — خالد يراجع.
- قرار خالد معلَّق: Clarity المكرّر (GTM + كودنا) · بكسلات الإعلانات وCSP.
- من تقرير GA4: توحيد الهويّة (`visitor-cookie.ts`) · h1 في `/users/register`.
- dev: سيرفرات 3000 و3001 تعمل؛ كاش `modonty/.next/dev` مُسح مرّة (مسارات قديمة بعد النقل).

## مؤجَّلٌ بقرار خالد

تدويرُ كلمة مرور قاعدة الإنتاج · النيوزليتر · `contentPriorities` · ترقية Flex → M10 · كبحُ الزواحف.
