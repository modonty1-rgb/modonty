# الجلسة الحاليّة

**٢٧ سبتمبر ٢٠٢٦ — ميديا الأقسام · Advanced Table · إصلاح الجدولة وحالة APPROVED**

## وقفنا عند

كل الشغل مرفوع على `main` (`ed1a9e3`) ومنشور. المراجعة بعد النشر على الإنتاج انتهت بقراءة فقط.

**الخطوة التالية:** تنتظر قرار خالد في نقطة واحدة: الـ29 مقالاً التي نشرها الكرون بلا جدولة بين 20 و27 سبتمبر، هل تبقى منشورة أو تُرجَع ويُبلَّغ العملاء؟

## ما أُنجز (مرفوع)

- **الجدولة:**
  - شرط الكرون صار `scheduledAt: { not: null, lte: now }` في `admin/app/api/cron/publish-scheduled/route.ts`.
  - سبب الإصلاح: `lte` وحدها كانت تطابق `null` على MongoDB.
- **حالة `APPROVED` للمقال:**
  - أُضيفت إلى السكيما في `shared/prisma/schema/schema.prisma`.
  - موافقة العميل تكتبها في `console/lib/mobile-api/article-decisions.ts`.
  - ممرّ جديد «Approved → Scheduled» في `articles/workflow/lib/transitions.ts` وفي السايدبار.
  - `set-scheduled-date.ts` ينقل المقال من APPROVED إلى SCHEDULED، ويرفض أي موعد فات.
  - حقل الموعد يبدأ ببكرة الساعة 9:00 (`scheduled-row-actions.tsx`).
  - أُضيفت الحالة إلى الخرائط الثمانية التي تعدّد الحالات، وإلى قوائم الحالات المسموحة، وإلى الكونسول (7 ملفات).
- **ميديا الأقسام:** ثلاث صفحات هي `/clients/media` و`/articles/media` و`/modonty/media`.
  - نافذة رفع: القصّ داخل النافذة، والوصف يُكتب بعد الصورة، واسم الملف يُشتقّ من الوصف، والوصف لا يتكرّر داخل نفس العميل.
  - فلتر Issues.
  - حماية من الحذف لصور المواقع والصور الافتراضية للمنصّة (`lib/media/usage-where.ts` و`can-delete-media.ts`).
- **Advanced Table:** طُبّق على Client Quotas و All Articles و All Clients.
  - المكوّنات المشتركة في `admin/components/shared/advanced-table/`.
  - `DataTable` صار يقبل `renderExpanded`، و`KpiToggle` صار يقبل `variant="tile"`.
  - الوصفة محفوظة في الذاكرة: `advanced-table-pattern.md`، والاختصار `adv>`.
- **تسميات:** صفحة «Client Quotas» (كانت Clients Articles)، وصفحة «Client-Site Articles» (كانت Client Articles).

## قرارات سارية

- **لا حذف للملفات القديمة حتى يؤكّد التيم.** الملفات: `articles-header-wrapper`، `articles-page-client`، `clients-header-wrapper`، `clients-tabs`، `clients-page-client`، `client-table`. ما زال `ArticleTable` مستخدَماً في صفحة التصنيف.
- **مصدر واحد للاشتراكات:** `getClientSubscriptions`. وصفحة Client Quotas تطبّق نفس حارس الطلب الساري.
- **صورة المقال تُرفع من ميديا المقالات فقط**، لا من ميديا مدونتي.
- **يُبلَّغ طارق** أن المقالات التي يوافق عليها العميل لا تُنشر وحدها بعد الآن، وأن جدولتها صارت من الممرّ الجديد.

## مقيس على الإنتاج (قراءة فقط، بعد النشر)

- **النسخة الجديدة شغّالة:** يوجد مقال واحد بحالة `APPROVED`.
- **المجدول:** مقال واحد (`SCHEDULED: 1`) موعده 17:00Z، وضعه طارق بنفسه. لا يوجد مقال مجدول بلا موعد، فالخطوة 3 أُغلقت دون أي تحويل للبيانات.
- **ما نُشر بلا جدولة منذ 20 سبتمبر:** 29 مقالاً، كلها ما زالت منشورة. أكبرها عند pain core clinic (12 مقالاً).

## Git

- الفرع `main`، متزامن مع origin، وآخر كوميت `ed1a9e3`.
- غير مرفوع: `docs/` فقط، ومستثنى عمداً.

## الحالة

| البند | الحالة |
|---|---|
| tsc | admin و console و modonty = صفر خطأ في الكود، عدا ملف سيرفر التطوير `.next/dev/types/validator.ts` المكتوب ناقصاً (مستبعد من المستودع) |
| النشر | تمّ، والدليل وجود مقال `APPROVED` في الإنتاج |
| الكونسول حيّاً | UNVERIFIED |
| حذف الملف القديم من Bunny بعد التحويل | UNVERIFIED (يعمل على الإنتاج فقط) |
| سرعة صفحات الميديا على الإنتاج | UNVERIFIED |
| بيانات dev المعدَّلة بالتجارب | شعار A.S CLINICS مربّع أحمر، وملفّا تجربة في مكتبة مدونتي |

**سيرفر خلفي:** أدمن dev على المنفذ 3001 (`bk7zr0q81`).
