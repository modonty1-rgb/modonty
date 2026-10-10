# السوشيال كاليندر (الأدمن) — تسليم لجهاز ٢ · ٩ أكتوبر ٢٠٢٦

## وقفنا عند
الفرع `worktree-agent-a191eddde456c6503` (worktree `.claude/worktrees/agent-a191eddde456c6503` على جهاز ١).
آخر كوميت `eedc3702` (٩ أكتوبر 00:30): مجموعتان باسم خاص `social_calendar_posts` · `social_calendar_post_assets`.
**الخطوة الجاية:** تقرير مطابقة مع النسخة القديمة (لم يُكتب)، ثم فحص حيّ على الأدمن المحلي.

## الوضع (مقيس ٩ أكتوبر)
- ١٣ كوميتاً فوق `origin/main`، و١٥ خلفه (`git rev-list --left-right --count origin/main...` → `15 13`).
- **غير موجود على GitHub** (`git ls-remote --heads origin` → ٠). يحتاج بوش بأمر خالد قبل ما يفتحه جهاز ٢.
- غير ملتزم في الـworktree: `.claude/settings.local.json` فقط.
- يلمس: ٩٥ ملفاً في `admin/app` · `admin/lib` · `admin/package.json` · `admin/scripts` · `shared/prisma/schema/schema.prisma` (+١٦٤) · `pnpm-lock.yaml` (`tus-js-client ^4.3.1`).

## ما بُني (من رسائل الكوميت)
- المرحلة ١+٤: لوحة العملاء · التقويم الشهري · دليل سير العمل · بند القائمة.
- المرحلة ٢+٣+٤+٦: نموذج المنشور · الإنتاج · النشر · التفصيل · المعرض · الأرشيف.
- إصلاحات «كالقديم»: كرت العميل وفلتره · رأس التقويم وشريط الأدوات (خطأ ترطيب) · نموذج المنشور (رؤوس Su..Sa · قفل الأيام الماضية في الإنشاء) · تفاصيل الإنتاج والنشر والمعرض والأرشيف · لوحة العملاء كانت تسقط (صفّ قديم بلا clientId).

## قبل أي شغل
- الفرع خلف `origin/main` بـ١٥ كوميتاً: rebase أو merge من main بأمر خالد قبل البوش النهائي.
- السكيما تتغيّر → `prisma generate` على جهاز ٢ · لا `db push` ولا seed على `modonty_dev` بلا إعلان (القاعدة مشتركة مع جهاز ١).
- التنسيق الكامل: `documents/context/sessions/two-laptops.md`.
