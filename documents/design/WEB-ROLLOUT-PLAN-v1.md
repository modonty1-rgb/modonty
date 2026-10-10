# خطة تطبيق معيار الويب — v1 (Claude Design · ٩ أكتوبر ٢٠٢٦)

> الحالة على فرع ui/modonty-web-icons: الإصلاحات العامة الستة مطبّقة ومتحقَّق منها محلياً (انظر WEB-STANDARD-v1.md).

المعيار
قائمة الإصلاحات
Tailwind mapping
قبل / بعد
خطة التطبيق
خطة التطبيق — 214 إصلاحاً بأقل مخاطرة

المبدأ: ما يُصلح في مكان واحد ويظهر في 69 صفحة يأتي أولاً؛ ثم المكوّنات المشتركة (shadcn)؛ ثم القوالب مجموعة حسب المكوّن الذي تتشاركه. كل خطوة لها فحص «تمّ عندما» قابل للقياس بإعادة تشغيل سكربت التدقيق نفسه (audit.mjs) على المقاسات الثلاثة.

المرحلة 0 · التأسيس (يوم 1)
#	الخطوة	الملفات	تمّ عندما
0.1	لصق theme.extend وطبقة @layer components من صفحة Tailwind mapping. لا حذف لأي صنف قديم بعد.	tailwind.config.ts · globals.css	البناء ينجح · لقطات Playwright للصفحات الثلاث (/, /articles/…, /clients/…) مطابقة 100% للحالية (لم يتغيّر شيء بعد).
0.2	تثبيت التدقيق كأمر CI: pnpm audit:ui يُخرج الملخّص نفسه (أنماط النص، H1، الأهداف، التباين).	scripts/audit.mjs	الأرقام المرجعية مسجّلة: D 99 نمطاً · 1,511 هدفاً · 126 تبايناً.
المرحلة 1 · الإصلاحات العامة الستة (أيام 2–4) — تصلح ~70% من القائمة
#	الإصلاح	المكان الواحد	التأثير	تمّ عندما
1.1 P0	روابط الفوتر 16px → h-8 py-2 max-md:h-11 text-label	components/layout/footer.tsx	−23 هدفاً × 69 صفحة = −1,587 (يتجاوز المقاس لأن الفوتر على كل صفحة)	أهداف <24 على Desktop: 1,511 → ≤ 120 · Tablet 319 → ≤ 90
1.2 P0	text-xs (12px) → text-caption (13/20). codemod: sed 's/\btext-xs\b/text-caption/g' ثم مراجعة يدوية للروابط والأزرار → text-label	codemod على app/ و components/	×1,897 عنصراً على Desktop	أصغر نص على كل صفحة = 13px · عدد 12/* في التدقيق = 0
1.3 P1	أيقونات: size-2.5 · size-3 · size-[15px] → size-4 · size-[18px] → size-5. ضبط lucide الافتراضي: strokeWidth 1.75 عند 24 و 1.25 عند 16	components/ui/icon.tsx + codemod	×155	مقاسات الأيقونات المرصودة ⊆ {16, 20, 24} (ما عدا الصور الشخصية)
1.4 P1	الأوزان: font-semibold · font-extrabold · font-black → font-bold؛ حذف 600/800/900 من fontWeight في الإعداد لإسقاط أي استخدام متبقٍ وقت البناء	codemod + tailwind.config.ts	×815	الأوزان المرصودة ⊆ {400, 500, 700}
1.5 P1	الزوايا: إعادة تعريف borderRadius (4/8/12/16/full) فتتحوّل rounded-md 6 → 8 و rounded-xl 12 و rounded-2xl 16 تلقائياً؛ codemod لـ rounded-[14px] · rounded-[20px] · rounded-3xl · rounded-[28%]	tailwind.config.ts + codemod	×14 قيمة → 5	قيم الزاوية المرصودة ⊆ {0, 4, 8, 12, 16, 9999}
1.6 P2	text-sm leading-[26px] (14/26) → text-body (16/26)	components/feed/post-card.tsx (مصدر الـ520)	×520	14/26 في التدقيق = 0 · عدد الأنماط على Desktop ≤ 40
المخاطرة: 1.2 و1.6 يكبّران النص فقد يلتفّ سطر إضافي في بطاقات ذات ارتفاع ثابت. الفحص: لا h-[…] ثابت على حاوية نص؛ لقطات الصفحات الثلاث على 390 بلا قصّ (overflow مرئي). تُنشر المرحلة 1 كاملة في إصدار واحد خلف علم NEXT_PUBLIC_UI_STD=1 ليوم واحد على staging.
المرحلة 2 · مكوّنات shadcn المشتركة (أيام 5–7)
#	المكوّن	التغيير	يصلح في	تمّ عندما
2.1 P0	Button	variants sm/md/lg/icon كما في الـmapping؛ حذف h-9 rounded-md text-sm الافتراضي؛ focus-ring في الـbase	كل الصفحات (~1,200 زر)	تركيبات ارتفاع/زاوية الأزرار: 20 → ≤ 5 (32/40/44/48 × full)
2.2 P0	زر «دخول» في رأس صفحات الشركاء	variant="default" (bg #3030FF) بدل التركوازي + أبيض	13 صفحة /clients/*	تباين الزر ≥ 7.0:1 · lowContrast الحقيقي = 0
2.3 P1	Input · Select · Textarea · Label · FormMessage	h-10 max-md:h-11 rounded-md text-body · label → text-label · message → text-caption	/users/* (7) · /contact · /subscribe · /booking · /help/feedback · /news/subscribe · /clients/*/book,contact	كل الحقول 40 (D/T) و44 (M)؛ لا تكبير تلقائي على iOS (16px)
2.4 P1	Badge (chips/tags)	h-8 px-3 rounded-full text-label؛ الصف الحاوي min-h-11 على Mobile	/tags · /categories · /industries/* · /clients/*/services · المقالات	أهداف <24 على Mobile: 140 → ≤ 10
2.5 P1	Card + Avatar	.card (p16 gap12 r8 e1، r0 على Mobile) · Avatar 24/32/48/72/128 · شعارات الشركات r8 بدل 28%	التغذية، الأشرطة، الشركاء	حشو كل بطاقة = 16 · rounded-[28%] = 0
2.6 P1	Breadcrumb	الرابط text-label py-1 px-2 rounded-sm؛ على Mobile يُستبدل بزر «رجوع» 44	المقالات، التصنيفات، الوسوم، الشركاء	كل روابط الـbreadcrumb ≥ 28×24
2.7 P1	Dialog · Sheet · DropdownMenu · Popover	r16 + e3 · r8 + e2 · عناصر القائمة h-10 (M: h-11)	عام	لا ظلال خارج e1/e2/e3
المرحلة 3 · القوالب حسب المكوّن المشترك (أيام 8–12)
#	المجموعة	المسارات	الإصلاح	تمّ عندما
3.1 P0	H1 مفقود	/users/login, register, forgot-password, reset-password, notifications, profile · /clients/*/followers, likes, mentions, reels	h1 مرئي text-h1 أو sr-only فوق المحتوى	كل مسار من 69 فيه H1 واحد بالضبط
3.2 P0	H1 بدور title/label	/ · /page/2 · /clients · /industries · /industries/* · /clients/تجريبي-… (14/20) · /clients/…/about (14/20/500) · /modo-chat · /reels · /search	عنوان الصفحة → text-h1؛ عناوين البطاقات تصبح h2 بـtext-title	H1 على Desktop ∈ {30/42/700, 40/52/700} فقط
3.3 P1	صفحات الهبوط (display)	/story 48/48/800 · /categories 48/48/900 · /tags 48/48/900 · /modo-link 36/40/900 · /modonty/health 36/40/900 · /about 36/40/700	text-display 40/52/700؛ /story يختصر 26 نمطاً → 9	لا وزن 800/900 · أنماط /story ≤ 12
3.4 P1	الحاويات	896: /about, /authors/*, /help/*, /legal/*, /team, /terms, /trust · 672: /contact, /news/*, /subscribe, /help/feedback · 448: /users/*, /accounts · 1216/1200: /clients/*/followers,likes,mentions,reels,reviews · /categories/*, /tags/* · 1024: /lucky-wheel · 768: /analytics	container-reading 768 · container-form 480 · container-feed 1128	العروض المرصودة ⊆ {1128, 768, 480} (+ أعمدة 225/555/300)
3.5 P0	شبكات تنكمش على Tablet/Mobile	/booking (T 27) · /modonty/entertainment (T 27 · M 25) · /modonty/education (T 18 · M 16) · /clients (M 13) · /industries/* (M 9)	عمودان عند <1024، عمود عند <768؛ عناصر الشبكة ≥ 44؛ chips في صف 44	أهداف <24: Tablet ≤ 10 · Mobile = 0
3.6 P1	صفحة المقال	/articles/*	h1 30/42 · h2 24/34 · body-lg 18/32 (M 17/30) · نص max 680 · TOC صفوف 40	الأنماط 28 → ≤ 10 · لا 18/33 ولا 40/50
3.7 P1	شرائح ملوّنة تحت AA	/tags (16) · /modonty (6) · /categories (4) · /categories/* (4) · /tags/* (4)	نص #0E065A على tint 10% من لون الفئة، أو bg #0E065A + أبيض	lowContrast (بعد استبعاد النص فوق الصور) = 0
3.8 P2	الريلز	/reels · /reels/*	عمود 225 + مشغّل 9:16 بارتفاع 100vh−56؛ عنوان 18/28/800 → text-h3	H1 موجود · لا وزن 800
المرحلة 4 · الإغلاق (يوم 13)
المقياس	قبل (2026-10-09)	الهدف
أنماط النص المتميّزة (D / T / M)	99 / 101 / 109	≤ 12 / ≤ 12 / ≤ 12 (9 أدوار + 3 استثناءات مسمّاة)
أنماط H1 / H2 / H3 على Desktop	22 / 20 / 12	2 / 1 / 1
أصغر نص	12px	13px
تركيبات الأزرار	~20	≤ 5
قيم الزاوية	14	5
مقاسات الأيقونات	12 مقاساً (10–56)	3 (16/20/24)
أهداف <24×24 (D / T / M)	1,511 / 319 / 140	0 / 0 / 0 (وعلى M كل الأهداف ≥ 44)
تباين تحت AA (حقيقي)	13 (دخول 1.43:1)	0
عروض الحاويات	1270 · 1216 · 1200 · 1128 · 1024 · 896 · 768 · 672 · 448	1128 · 768 · 480
بعد الإغلاق: pnpm audit:ui يفشل الـCI إذا ظهر نمط نص خارج الأدوار التسعة، أو هدف <24، أو وزن خارج {400,500,700}، أو زاوية خارج السلّم. هذا ما يمنع العودة إلى 99 نمطاً.