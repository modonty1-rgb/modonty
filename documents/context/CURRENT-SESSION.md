# الجلسة الحاليّة

**٣٠ سبتمبر ٢٠٢٦ (مساءً): عمولات المناديب في الأدمن، وفحص الكونسول على الجوّال، وإصلاح السينك**

## وقفنا عند

رجّعنا دايلوج الصرف في صفحة العمولات. الدايلوج يطلع مرّة واحدة لكل ضغطة على «اصرف المحدد»، وفيه تاريخ الصرف وملاحظة. وشلنا خانة الملاحظة من شريط الجدول. جرّبناه حيّاً على dev.

**كل شغل هذه الجلسة غير مثبّت وغير مرفوع.**

**الخطوة التالية:** ننتظر `push>` من خالد. على الإنتاج نحتاج جدولَي العمولات وفهارسهما (`prisma db push`)، ولا ننفّذ ذلك إلا بأمره.

## ما أُنجز (غير مثبّت)

| العمل | الملفّات |
|---|---|
| **عمولات المناديب:** نسبة لكل مندوب (جديد وتجديد)، على المبلغ قبل الضريبة. الاسترداد يُلغي العمولة، وما انصرف منها يُخصم من الصرفية القادمة. تغيير النسبة لا يمسّ الصفقات القديمة. الصرف يكون بتحديد الطلبات ثم الضغط على «اصرف المحدد»، والصفحة للأدمن فقط. | `shared/prisma/schema/schema.prisma` (`SalesCommissionRate` و`SalesCommissionPayout`، ونوع `SalesCommissionPayoutItem`) · `admin/lib/commissions/get-sales-commissions.ts` · `admin/app/(dashboard)/sales-commissions/` (`page`، و`loading`، و`components/unpaid-orders-table`، و`delete-payout-button`، و`actions/record-` و`delete-commission-payout`) |
| **النسبة من صفحة الموظف (SALES):** بدون رابط لصفحة العمولات. | `admin/app/(dashboard)/users/[id]/` (`page`، و`components/commission-rate-section`، و`rate-dialog`، و`actions/set-commission-rate`) · `admin/lib/audit/log-action.ts` |
| **ربط التجديد بالعميل القائم** من صفحة التفعيل. | `admin/app/(dashboard)/clients/activate/[orderId]/` (`helpers/find-existing-client-for-order`، و`actions/link-renewal-to-client`، و`components/link-renewal-button`، و`page`) |
| **صفحة `/orders`:** وجه مبتسم أو زعلان للعمولة جنب رقم الطلب (للأدمن). عمود «المندوب» جنب العميل: مندوب أحدث طلب، وإلّا مندوب العميل. حبوب فلتر للمناديب `?rep=` ومعها «بلا مندوب». | `admin/app/(dashboard)/orders/page.tsx` · `components/orders-table.tsx` · `components/order-status-filter.tsx` |
| **قائمة المبيعات:** بند «عمولات المناديب» للأدمن. | `admin/components/admin/sales-menu.tsx` · `header.tsx` · `admin/app/(dashboard)/layout.tsx` · `breadcrumb-utils.ts` |
| **عين كلمة المرور** في صفحة الموظف. | `admin/app/(dashboard)/users/components/user-form.tsx` |
| **السينك يحتفظ بحسابات الموظفين المحلّيّة:** سبب خطأ «An unexpected response…» أن الحساب انمسح فسقطت الجلسة. | `admin/app/api/dev/sync-local-from-prod/route.ts` |
| **فحص الكونسول على الجوّال:** بدون أي فيضان، والأزرار الصغيرة كبرت إلى 44، والخطوط الصغيرة صارت 12. | `console/components/ui/{button,input,checkbox,sheet}.tsx` · ملفّات كثيرة في `console/app/(dashboard)/` · `shared/components/ui/switch.tsx` · `shared/components/confirm-delete-button.tsx` · `shared/components/media-upload-zone.tsx` |
| **سكربتات الفحص:** | `.claude/skills/subscriber-journey-qa/scripts/` (`_mobile-audit.mjs`، و`mobile-run.mjs`، و`console-mobile-run.mjs`) |

## قرارات خالد السارية

- **مصدر العمولة:** تُحسب من الطلب، ولا تُخزَّن. المخزَّن فقط الصرفيات، ومعها مبلغ كل طلب يوم الصرف.
- **التجديد:** نسبته أقل. والعميل الذي استُرد طلبه الأول، يُحسب طلبه المدفوع التالي «جديداً».
- **دايلوج الصرف:** يبقى، لأنه يطلع مرّة واحدة لكل ضغطة لا لكل سطر.
- **وجوه العمولة في `/orders`:** أيقونات Smile وFrown من lucide، لا إيموجي.
- **بيانات التجربة:** لا تُحذف.

## حالة dev بعد سينك الليلة

`modonty_dev` صارت نسخة من الإنتاج.

- **طلبات تجربة العمولات القديمة:** اختفت.
- **جداول العمولات:** باقية، لأنها غير موجودة في الإنتاج. فيها نسبتان وصرفية ٠٠٠٥١ (١٠٤٫٠٩ ر.س)، وهذه الصرفية تشير لطلب غير موجود، فتضخّم رقم «ما انصرف له».
- **حساب `claude-check@modonty.local`:** أُعيد بنفس المعرّف `6aa404ee…`.
- **حسابات مفقودة:** `claude-check-editor@modonty.local` و`q-01@test.local` (الكونسول)، ولم تُعَد.
- **ملاحظة:** طلبات «[تجربة]» موجودة في الإنتاج نفسه، منها ORD-2026-00054 مدفوع اليوم.

## معلّق بقرار خالد

- **حذف الصرفية اليتيمة ٠٠٠٥١.**
- **إعادة حسابَي الفحص** (EDITOR والكونسول)، وتوسيع السينك ليحفظ حساب الكونسول أيضاً.
- **proxy.ts:** إن انتهت الجلسة ينقل لصفحة الدخول نظيفاً بدل رسالة الخطأ. هذا اقتراح لم يُنفَّذ.
- **KPI:** الـ٨ عملاء بلا كاتب، وصفحات Graphics وSales لاحقاً.
- **تذكير:** أرقام واتساب من الإعلانات (CTWA).

## Git

- الفرع `main`، وآخر كوميت `0070542`، ومتزامن مع origin عند آخر فحص.
- **غير مثبّت:** ~115 مسار (الجدول أعلاه، مع تعديلات قديمة غير متعلّقة في الأدمن والكونسول).
- **ملفّات جديدة غير متتبَّعة:** `sales-commissions/` و`lib/commissions/` وأخرى، فلا يوجد `git diff` لها.

## الفحوص

- **حيّاً على dev (Playwright، هذه الجلسة):**
  - العمولات: الصرف والحذف والخصم والوجوه.
  - فلتر المناديب: ٢٤ + ٦ + ٢٢ = ٥٢ = «الكل».
  - السينك: ١٢٢/١٢٢ جدولاً، وصفر صفوف مكسورة، وstaff ١٨.
  - دايلوج الصرف: يفتح ويُلغى.
- **tsc/build:** UNVERIFIED. يُشغَّلان مع `push>` فقط.

## ملاحظات تشغيل

- **سيرفرات dev:** الأدمن 3001 والكونسول 3002. إعادة توليد Prisma تتطلب إيقافهما أولاً (خطأ EPERM).
- **الحذف:** بـPowerShell فقط.
- **Playwright:** لا `browser_resize`.
