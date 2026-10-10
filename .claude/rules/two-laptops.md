# جهازان يشتغلان معاً — اقرأ قبل أي تعديل (خالد ٩ أكتوبر ٢٠٢٦)

خالد يشغّل جلستَي Claude على لابتوبين في نفس الوقت. خالد ضعيف في git — **لا تفترض أنه يعرف أي أمر**؛ اشرح كل خطوة git بالعربي واطلب أمره قبل push/merge.

## مَن يملك ماذا

| | جهاز ١ | جهاز ٢ |
|---|---|---|
| الشغل | تطبيق القارئ (الجوال) + Claude Design | ١) السوشيال كاليندر ثم ٢) أيقونات البراند v2 + واجهة الموقع |
| يلمس فقط | `modonty-mobile/` · `modonty/app/api/mobile/` | الكاليندر: `admin/` + `shared/prisma/schema/schema.prisma` · الأيقونات: `shared/components/icons/` · `shared/lib/icons.ts` · `modonty/` |
| الفرع | `claude/modonty-mobile-reader-fixes` | الكاليندر: `worktree-agent-a191eddde456c6503` · الأيقونات: `ui/icons-v2` (جديد من `origin/main`) |

**أي ملف خارج عمودك: توقّف واسأل خالد.** لا تعدّل ملفاً يملكه الجهاز الآخر ولو بدا خطأً واضحاً — سجّله وأبلغ.

## ممنوع بلا إعلان لخالد
- `pnpm-lock.yaml` وأي `pnpm add/install` (ولا `--filter` أبداً).
- `db push` · migration · seed على `modonty_dev` (القاعدة مشتركة بين الجهازين).
- push · merge · rebase على `main` — بأمر خالد فقط، والدمج جهاز بعد جهاز.

## الأيقونات
`modonty-mobile/scripts/generate-icons.mjs` يولّد أيقونات التطبيق من `shared/components/icons/` — جهاز ٢ يحسّن المصدر، وجهاز ١ يعيد التوليد. لا نسخة أيقونات ثانية.

التفاصيل والحالة: `documents/context/sessions/two-laptops.md` · تسليم الكاليندر: `documents/context/sessions/social-calendar.md`.
