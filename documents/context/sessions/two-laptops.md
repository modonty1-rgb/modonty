# تنسيق جهازين — من ٩ أكتوبر ٢٠٢٦

جهاز ١ = هذا اللابتوب (جلسة الجوال). جهاز ٢ = اللابتوب الثاني (خالد + جلسة Claude ثانية).
كل جهاز يلمس مجلّداته فقط. أي ملف خارج عموده = يُسأل خالد قبل لمسه.

## من يملك ماذا

| | جهاز ١ (الجوال) | جهاز ٢ |
|---|---|---|
| المهمّة ١ | تطبيق القارئ + Claude Design (الشاشات) | **السوشيال كاليندر** (الأدمن) — أوّلاً |
| المهمّة ٢ | — | **أيقونات البراند v2 + واجهة الموقع** — بعد الكاليندر |
| المجلّدات | `modonty-mobile/` · `modonty/app/api/mobile/` | الكاليندر: `admin/` + `shared/prisma/schema/schema.prisma` · الأيقونات: `shared/components/icons/` · `shared/lib/icons.ts` · `modonty/` (الواجهة) |
| الفرع | `claude/modonty-mobile-reader-fixes` (worktree `C:\tmp\mc`) | الكاليندر: `worktree-agent-a191eddde456c6503` · الأيقونات: فرع جديد من `origin/main` (`ui/icons-v2`) |

## مناطق مشتركة — تُعلَن قبل اللمس

| الملف | لماذا |
|---|---|
| `pnpm-lock.yaml` | الكاليندر يضيف `tus-js-client` · أي تثبيت من الجهازين يتعارض. لا `pnpm install --filter` (يقطع روابط حزم أخرى) |
| `shared/prisma/schema/schema.prisma` | الكاليندر يضيف +١٦٤ سطراً (`social_calendar_posts` · `social_calendar_post_assets`) |
| `modonty_dev` (قاعدة مشتركة) | لا seed ولا migration ولا db push بلا إعلان · Atlas سجّل «Connections above 80%» سابقاً → شغّل على جهاز ٢ سيرفر الأدمن وحده |

## الأيقونات ← التطبيق

`modonty-mobile/scripts/generate-icons.mjs:1` يولّد أيقونات التطبيق من `shared/components/icons/`.
أي أيقونة يحسّنها جهاز ٢ تصل التطبيق بإعادة تشغيل المولِّد على جهاز ١ — لا نسخة ثانية.
خطوة «إعادة رسم الأيقونات» في Claude Design صارت لجهاز ٢ (جهاز ١ لا يرسلها).
المرجع: ٧٢ ملفاً في `shared/components/icons/` · ٦١ مسجّلة في `shared/lib/icons.ts`.

## تجهيز جهاز ٢ (مرّة واحدة)

1. `git clone` المستودع · `pnpm install` (من الجذر، كاملاً).
2. ملفات env بفلاشة (لا تمرّ بـgit ولا بالشات): `admin/.env` `admin/.env.local` · `shared/.env` `shared/.env.local` · `.env.shared` (الجذر). وللأيقونات/الموقع: `modonty/.env` `modonty/.env.local`.
3. `git fetch` ثم `git switch worktree-agent-a191eddde456c6503` — **يحتاج أوّلاً بوش هذا الفرع من جهاز ١ بأمر خالد** (غير موجود على GitHub اليوم).
4. في Claude على جهاز ٢: `hh> social-calendar`.

## الدمج

كل جهاز يبوش فرعه بأمر خالد. الدمج في `main` واحد بعد الثاني، بأمر خالد. لا push ولا merge تلقائي.
