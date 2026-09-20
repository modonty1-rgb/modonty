# الجلسة الحاليّة

**٢٠ سبتمبر ٢٠٢٦ — تنفيذ قائمة ما بعد الرفع على الإنتاج، ثمّ إلغاء الطلب**

## وقفنا عند

الطلباتُ الخمسة القابلة للإلغاء على الإنتاج تنتظر قرارَ خالد — `ORD-2026-00002`
اختبارُه، والأربعةُ الباقية (`00003`–`00006`) زوّارٌ حقيقيّون لم يُكملوا، وإلغاؤهم
قرارُ مبيعاتٍ لا قرارُ نظام.

**الخطوة التالية:** ينتظر جوابَ خالد على سؤالين — أيّ الطلبات تُلغى، وهل يُبنى زرّ
«تراجع عن الإلغاء» (الإلغاءُ اليوم طريقٌ ذو اتجاهٍ واحد، لا فعلَ يعيد الطلب).

## الحالة التقنيّة

| | |
|---|---|
| الفرع · آخر كوميت | `main` · `821f672` |
| غير مثبَّت | لا شيء — الشجرة نظيفة · `origin/main...main = 0 0` |
| البناء | `pnpm --filter @modonty/admin build` = **نجح** (قيس هذه الجلسة) |
| النشر | admin **READY** على `821f672` · الثلاثة `CANCELED` (لم تتغيّر) · الروابط الأربعة 200 |

## ما أُنجز

**قائمة ما بعد الرفع — ١٠/١٠** (الأدلّة مسجَّلة في `documents/tasks/AFTER-DEPLOY.html`):
متغيّرات البيئة · الدفع · صفر بريدٍ مكرَّر (٤٢/٤٢ فريد) · دفعُ فهرسَي السكيما على
`modonty` · ترحيلُ الطلبات (٤٨ طلباً · ٤٢ مربوطاً · ٤٢/٤٢ مؤشّر) · ترحيلُ ٢٧ وثيقة ·
رقمُ الواتساب · صفر طلبٍ مدفوعٍ بلا عميل · صفحاتُ المال · مراقبةُ أطلس بدأت.

**الملفّات التي تغيّرت:**
- `admin/app/(dashboard)/orders/actions/cancel-order.ts` — **جديد**
- `admin/app/(dashboard)/orders/components/cancel-order-button.tsx` — **جديد**
- `admin/app/(dashboard)/orders/[id]/page.tsx` — تركيبُ زرّ الإلغاء
- `admin/lib/audit/log-action.ts` — `order.cancel`
- `admin/app/(dashboard)/orders-migration/helpers/plan-rebuild.ts` — `willDelete`→`existing` + `toBuild`/`alreadyHave`
- `admin/app/(dashboard)/orders-migration/components/rebuild-orders-panel.tsx` — نصُّ «سيُمسح» الكاذب · مرحلة `wipe`→`skip` · إخفاءُ الزرّ عند الصفر
- `admin/app/(dashboard)/migrations/page.tsx` · `admin/lib/orders-migration-gate.ts` — تعليقٌ مخالفٌ للسلوك · فرعٌ ميّت · `reason:"already-done"`
- `payment/app/[market]/checkout/{failed,success}/page.tsx` — `salesWhatsappWithText()` بدل المتغيّر
- `payment/app/error.tsx` — تُبقي المتغيّرَ مع توثيق السبب
- `documents/tasks/AFTER-DEPLOY.html` — أدلّةُ الخطوات

## قرارات فاعلة

- **رقم المبيعات = `+966541018020`** (خالد). كُتب في `Settings → Business → Sales phone`
  على الإنتاج، وصفحةُ الدفع الحيّة صارت `wa.me/966541018020`.
- **الإلغاء للحالتين وحدهما** `AWAITING_PAYMENT`/`AWAITING_TRANSFER`، ويُرفض متى صدرت
  فاتورة، ويُطلب رقمُ الطلب أو آخر أربعةٍ منه مكتوباً باليد.
- **لا التفافَ على قواعد المنع في `~/.claude/settings.json`.** `prisma db push` ممنوعٌ
  هناك؛ نُفِّذ بيد خالد عبر `scratchpad/push-prod-schema.ps1` (فيه حارسٌ يرفض إن لم تكن
  القاعدة `modonty`). وأوّلُ محاولةٍ بصيغة Bash في PowerShell ذهبت إلى `modonty_dev`
  — بلا ضرر، ثمّ أُعيدت صحيحة.

## عوائق

- **بانر Vercel: «Payment failed, pay any open invoices before your account is shut
  down»** — خارج الكود، ولو تعطّل الحساب تسقط الأربعة معاً. يخصّ خالد.
- **الإلغاء بلا تراجع** — لا فعلَ يعيد طلباً ملغى.
- **تعذّر الاختبارُ المحلّيّ للإلغاء:** `modonty_dev` فيها صفرُ طلبٍ قابلٍ للإلغاء،
  وصنعُ واحدٍ من صفحة الدفع المحلّيّة فشل (النموذج يُرسَل `GET` — الصفحةُ لا تتحلّل على
  اللوكل). فالاختبارُ جرى على الإنتاج على `ORD-2026-00001` وحده.

## مؤجَّلٌ بقرار خالد

تدويرُ كلمة مرور قاعدة الإنتاج · النيوزليتر · `contentPriorities` (= كلمات العميل
المفتاحيّة، **لا تُحذف**) · مخزنٌ مشترك لذاكرات `archive-cache` · ترقيةُ Flex → M10 ·
كبحُ الزواحف.

## درسٌ سُجِّل في الذاكرة

`mongo-null-does-not-match-missing` — في Prisma على مونغو `field: null` **لا** يطابق
حقلاً غائباً (نصُّ التوثيق). ثالثُ لقاءٍ به، وكلُّ مرّةٍ يعطي **صفراً كاذباً** يبدو
حالةَ عملٍ سليمة. أيُّ `count: 0` مفاجئ: اشتبه به أوّلاً.
