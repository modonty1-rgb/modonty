# قائمة إصلاحات الويب — v1 (Claude Design · ٩ أكتوبر ٢٠٢٦)

> مرجعها: `WEB-STANDARD-v1.md`. بند «النص الثانوي → #5C5C73» مرفوض (لا ألوان جديدة) — يبقى #5b5b5b.

المعيار
قائمة الإصلاحات
Tailwind mapping
قبل / بعد
قائمة الإصلاحات لكل قالب

69 مساراً × 3 مقاسات. الأرقام هي القياس من الـDOM (2026-10-09). الأولوية: P0 وصول/قابلية استخدام مكسورة · P1 يكسر المعيار بشكل ظاهر · P2 تنظيف.

214 إصلاحاً:
P0 ·
105
P1 ·
54
P2 ·
55
إصلاحات عامة (تُطبّق مرة واحدة وتظهر على كل صفحة)
P0 · روابط الفوتر 16px → صف h-8 py-2 (Mobile h-11) — يزيل ~23 هدفاً من كل صفحة · P0 · كل text-xs (12px ×1897) → text-caption 13/20 · P1 · أيقونات 10/12/15 → 16، 18 → 20 · P1 · الوزن 600 → 700 و 800/900 → 700 · P1 · الزوايا 2/3/6/14/20/24/28%/32 → سلّم 4/8/12/16/full · P2 · 14/26/400 (×520) → text-body 16/26.
#	الصفحة	المقاس	المشكلة (القياس)	الإصلاح (القيمة)	الأولوية
1	/	الكل	H1 16/24/400 — دور title/label مستخدم كعنوان صفحة	h1 → 30/42/700 (28/38 · 26/36)؛ عناوين البطاقات تبقى title 16/24/700 بوسم h2/h3	
P0

2	/	D 37 · T 4 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

3	/	الكل	1 نص تحت AA (ميتا ثانوية)	النص الثانوي → #5C5C73 (6.0:1)	
P1

4	/	Desktop	20 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

5	/about	الكل	H1 36/40/700 — وزن 700 ومقاس خارج السلّم	display → 40/52/700 (36/48 · 32/42)	
P1

6	/about	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

7	/about	Desktop	حاوية 896/864	container-reading 768 (px-6)	
P2

8	/about	Desktop	19 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

9	/accounts	الكل	H1 26/33/900 — خارج السلّم، وزن 900	h1 → 30/42/700 (28/38 · 26/36)	
P1

10	/accounts	Desktop	حاوية 448/416	container-form 480	
P2

11	/analytics	الكل	H1 24/32/700 — خارج السلّم	h1 → 30/42/700 (28/38 · 26/36)	
P1

12	/analytics	D 22 · T 1 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

13	/articles	الكل	H1 28/32/900 — خارج السلّم، وزن 900	h1 → 30/42/700 (28/38 · 26/36)	
P1

14	/articles	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

15	/articles	Desktop	19 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

16	/articles/مشاركة-مدونتي-في-techne-summit-2026	الكل	H1 40/50/700 — خارج السلّم	h1 → 30/42/700 (28/38 · 26/36)	
P1

17	/articles/مشاركة-مدونتي-في-techne-summit-2026	D 44 · T 4 · M 4	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

18	/articles/مشاركة-مدونتي-في-techne-summit-2026	Desktop	28 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

19	/articles/مشاركة-مدونتي-في-techne-summit-2026	الكل	متن المقال 18/33 وعنوان 40/50	body-lg 18/32 (Mobile 17/30) · h1 30/42 · عرض النص max 680	
P1

20	/audio	الكل	H1 20/28/700 — خارج السلّم	h1 → 30/42/700 (28/38 · 26/36)	
P1

21	/audio	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

22	/authors/modonty	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

23	/authors/modonty	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

24	/authors/modonty	Desktop	حاوية 896/864	container-reading 768 (px-6)	
P2

25	/booking	الكل	H1 24/30/700 — خارج السلّم	h1 → 30/42/700 (28/38 · 26/36)	
P1

26	/booking	D 48 · T 27 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

27	/booking	Tablet 27	أهداف صغيرة على Tablet (27) — شبكة المواعيد/البطاقات تنكمش	عناصر الشبكة ≥ 44، فاصل 8، عمودان بدل ثلاثة عند < 1024	
P0

28	/categories	الكل	H1 48/48/900 — وزن 900 ومقاس خارج السلّم	display → 40/52/700 (36/48 · 32/42)	
P1

29	/categories	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

30	/categories	الكل	4 نصوص تحت AA — شرائح التصنيف/الوسوم على خلفية ملوّنة	نص الشريحة → #1F1F33 على tint 10% من لون الفئة؛ أو bg #0E065A + نص أبيض	
P1

31	/categories/health-wellness	الكل	H1 36/40/700 — خارج السلّم	h1 → 30/42/700 (28/38 · 26/36)	
P1

32	/categories/health-wellness	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

33	/categories/health-wellness	الكل	4 نصوص تحت AA — شرائح التصنيف/الوسوم على خلفية ملوّنة	نص الشريحة → #1F1F33 على tint 10% من لون الفئة؛ أو bg #0E065A + نص أبيض	
P1

34	/categories/health-wellness	Desktop	حاوية 1200 بجوار 1128	توحيد على 1128	
P1

35	/clients	الكل	H1 16/24/700 — دور title/label مستخدم كعنوان صفحة	h1 → 30/42/700 (28/38 · 26/36)؛ عناوين البطاقات تبقى title 16/24/700 بوسم h2/h3	
P0

36	/clients	D 37 · T 14 · M 13	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

37	/clients	Mobile 13	أهداف صغيرة على Mobile (13) — chips/روابط الصناعات	chip h-8 داخل صف h-11؛ فاصل 8	
P0

38	/clients	Desktop	16 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

39	/clients/تجريبي-عيادة-النخبة	الكل	H1 14/20/700 — دور title/label مستخدم كعنوان صفحة	h1 → 30/42/700 (28/38 · 26/36)؛ عناوين البطاقات تبقى title 16/24/700 بوسم h2/h3	
P0

40	/clients/تجريبي-عيادة-النخبة	D 10 · T 7 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + روابط التواصل 20px	footer a → h-8 py-2 (Mobile h-11) · روابط التواصل → list row h-10 أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

41	/clients/تجريبي-عيادة-النخبة	الكل	زر «دخول» بتباين 1.43:1 (نص أبيض على تركوازي)	bg #3030FF + نص #fff (7.0:1) أو bg #00D8D8 + نص #0E065A (9.9:1)	
P0

42	/clients/تجريبي-عيادة-النخبة	Desktop	19 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

43	/clients/تجريبي-عيادة-النخبة/about	الكل	H1 14/20/500 — دور title/label مستخدم كعنوان صفحة	h1 → 30/42/700 (28/38 · 26/36)؛ عناوين البطاقات تبقى title 16/24/700 بوسم h2/h3	
P0

44	/clients/تجريبي-عيادة-النخبة/about	D 8 · T 6 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + روابط التواصل 20px	footer a → h-8 py-2 (Mobile h-11) · روابط التواصل → list row h-10 أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

45	/clients/تجريبي-عيادة-النخبة/about	الكل	زر «دخول» بتباين 1.43:1 (نص أبيض على تركوازي)	bg #3030FF + نص #fff (7.0:1) أو bg #00D8D8 + نص #0E065A (9.9:1)	
P0

46	/clients/تجريبي-عيادة-النخبة/articles	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

47	/clients/تجريبي-عيادة-النخبة/articles	D 8 · T 6 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + روابط التواصل 20px	footer a → h-8 py-2 (Mobile h-11) · روابط التواصل → list row h-10 أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

48	/clients/تجريبي-عيادة-النخبة/articles	الكل	زر «دخول» بتباين 1.43:1 (نص أبيض على تركوازي)	bg #3030FF + نص #fff (7.0:1) أو bg #00D8D8 + نص #0E065A (9.9:1)	
P0

49	/clients/تجريبي-عيادة-النخبة/book	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

50	/clients/تجريبي-عيادة-النخبة/book	D 10 · T 7 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + روابط التواصل 20px	footer a → h-8 py-2 (Mobile h-11) · روابط التواصل → list row h-10 أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

51	/clients/تجريبي-عيادة-النخبة/book	الكل	زر «دخول» بتباين 1.43:1 (نص أبيض على تركوازي)	bg #3030FF + نص #fff (7.0:1) أو bg #00D8D8 + نص #0E065A (9.9:1)	
P0

52	/clients/تجريبي-عيادة-النخبة/contact	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

53	/clients/تجريبي-عيادة-النخبة/contact	D 11 · T 8 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + روابط التواصل 20px	footer a → h-8 py-2 (Mobile h-11) · روابط التواصل → list row h-10 أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

54	/clients/تجريبي-عيادة-النخبة/contact	الكل	زر «دخول» بتباين 1.43:1 (نص أبيض على تركوازي)	bg #3030FF + نص #fff (7.0:1) أو bg #00D8D8 + نص #0E065A (9.9:1)	
P0

55	/clients/تجريبي-عيادة-النخبة/faq	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

56	/clients/تجريبي-عيادة-النخبة/faq	D 10 · T 7 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + روابط التواصل 20px	footer a → h-8 py-2 (Mobile h-11) · روابط التواصل → list row h-10 أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

57	/clients/تجريبي-عيادة-النخبة/faq	الكل	زر «دخول» بتباين 1.43:1 (نص أبيض على تركوازي)	bg #3030FF + نص #fff (7.0:1) أو bg #00D8D8 + نص #0E065A (9.9:1)	
P0

58	/clients/تجريبي-عيادة-النخبة/followers	الكل	لا يوجد H1 في الصفحة	إضافة H1 بدور h1 (30/42 · 28/38 · 26/36، وزن 700) أو sr-only إن كان العنوان مرئياً في مكوّن آخر	
P0

59	/clients/تجريبي-عيادة-النخبة/followers	D 8 · T 6 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + روابط التواصل 20px	footer a → h-8 py-2 (Mobile h-11) · روابط التواصل → list row h-10 أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

60	/clients/تجريبي-عيادة-النخبة/followers	الكل	زر «دخول» بتباين 1.43:1 (نص أبيض على تركوازي)	bg #3030FF + نص #fff (7.0:1) أو bg #00D8D8 + نص #0E065A (9.9:1)	
P0

61	/clients/تجريبي-عيادة-النخبة/followers	Desktop	حاوية 1216/1184 — أعرض من الشبكة	container-feed 1128، أعمدة 225 · 555 · 300	
P1

62	/clients/تجريبي-عيادة-النخبة/likes	الكل	لا يوجد H1 في الصفحة	إضافة H1 بدور h1 (30/42 · 28/38 · 26/36، وزن 700) أو sr-only إن كان العنوان مرئياً في مكوّن آخر	
P0

63	/clients/تجريبي-عيادة-النخبة/likes	D 8 · T 6 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + روابط التواصل 20px	footer a → h-8 py-2 (Mobile h-11) · روابط التواصل → list row h-10 أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

64	/clients/تجريبي-عيادة-النخبة/likes	الكل	زر «دخول» بتباين 1.43:1 (نص أبيض على تركوازي)	bg #3030FF + نص #fff (7.0:1) أو bg #00D8D8 + نص #0E065A (9.9:1)	
P0

65	/clients/تجريبي-عيادة-النخبة/likes	Desktop	حاوية 1216/1184 — أعرض من الشبكة	container-feed 1128، أعمدة 225 · 555 · 300	
P1

66	/clients/تجريبي-عيادة-النخبة/mentions	الكل	لا يوجد H1 في الصفحة	إضافة H1 بدور h1 (30/42 · 28/38 · 26/36، وزن 700) أو sr-only إن كان العنوان مرئياً في مكوّن آخر	
P0

67	/clients/تجريبي-عيادة-النخبة/mentions	D 8 · T 6 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + روابط التواصل 20px	footer a → h-8 py-2 (Mobile h-11) · روابط التواصل → list row h-10 أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

68	/clients/تجريبي-عيادة-النخبة/mentions	الكل	زر «دخول» بتباين 1.43:1 (نص أبيض على تركوازي)	bg #3030FF + نص #fff (7.0:1) أو bg #00D8D8 + نص #0E065A (9.9:1)	
P0

69	/clients/تجريبي-عيادة-النخبة/mentions	Desktop	حاوية 1216/1184 — أعرض من الشبكة	container-feed 1128، أعمدة 225 · 555 · 300	
P1

70	/clients/تجريبي-عيادة-النخبة/photos	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

71	/clients/تجريبي-عيادة-النخبة/photos	D 8 · T 6 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + روابط التواصل 20px	footer a → h-8 py-2 (Mobile h-11) · روابط التواصل → list row h-10 أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

72	/clients/تجريبي-عيادة-النخبة/photos	الكل	زر «دخول» بتباين 1.43:1 (نص أبيض على تركوازي)	bg #3030FF + نص #fff (7.0:1) أو bg #00D8D8 + نص #0E065A (9.9:1)	
P0

73	/clients/تجريبي-عيادة-النخبة/reels	الكل	لا يوجد H1 في الصفحة	إضافة H1 بدور h1 (30/42 · 28/38 · 26/36، وزن 700) أو sr-only إن كان العنوان مرئياً في مكوّن آخر	
P0

74	/clients/تجريبي-عيادة-النخبة/reels	D 8 · T 6 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + روابط التواصل 20px	footer a → h-8 py-2 (Mobile h-11) · روابط التواصل → list row h-10 أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

75	/clients/تجريبي-عيادة-النخبة/reels	الكل	زر «دخول» بتباين 1.43:1 (نص أبيض على تركوازي)	bg #3030FF + نص #fff (7.0:1) أو bg #00D8D8 + نص #0E065A (9.9:1)	
P0

76	/clients/تجريبي-عيادة-النخبة/reels	Desktop	حاوية 1216/1184 — أعرض من الشبكة	container-feed 1128، أعمدة 225 · 555 · 300	
P1

77	/clients/تجريبي-عيادة-النخبة/reviews	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

78	/clients/تجريبي-عيادة-النخبة/reviews	D 8 · T 6 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + روابط التواصل 20px	footer a → h-8 py-2 (Mobile h-11) · روابط التواصل → list row h-10 أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

79	/clients/تجريبي-عيادة-النخبة/reviews	الكل	زر «دخول» بتباين 1.43:1 (نص أبيض على تركوازي)	bg #3030FF + نص #fff (7.0:1) أو bg #00D8D8 + نص #0E065A (9.9:1)	
P0

80	/clients/تجريبي-عيادة-النخبة/reviews	Desktop	حاوية 1216/1184 — أعرض من الشبكة	container-feed 1128، أعمدة 225 · 555 · 300	
P1

81	/clients/تجريبي-عيادة-النخبة/services	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

82	/clients/تجريبي-عيادة-النخبة/services	D 8 · T 6 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + روابط التواصل 20px	footer a → h-8 py-2 (Mobile h-11) · روابط التواصل → list row h-10 أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

83	/clients/تجريبي-عيادة-النخبة/services	الكل	زر «دخول» بتباين 1.43:1 (نص أبيض على تركوازي)	bg #3030FF + نص #fff (7.0:1) أو bg #00D8D8 + نص #0E065A (9.9:1)	
P0

84	/clients/تجريبي-عيادة-النخبة/services	Desktop	18 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

85	/contact	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

86	/contact	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

87	/contact	Desktop	حاوية 672/640	container-form 480	
P2

88	/help	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

89	/help	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

90	/help	Desktop	حاوية 896/864	container-reading 768 (px-6)	
P2

91	/help/faq	الكل	H1 30/36/600 — خارج السلّم، وزن 600	h1 → 30/42/700 (28/38 · 26/36)	
P1

92	/help/faq	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

93	/help/faq	Desktop	حاوية 896/864	container-reading 768 (px-6)	
P2

94	/help/feedback	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

95	/help/feedback	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

96	/help/feedback	Desktop	حاوية 672/640	container-form 480	
P2

97	/industries	الكل	H1 16/24/700 — دور title/label مستخدم كعنوان صفحة	h1 → 30/42/700 (28/38 · 26/36)؛ عناوين البطاقات تبقى title 16/24/700 بوسم h2/h3	
P0

98	/industries	D 43 · T 10 · M 9	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

99	/industries	Mobile 9	أهداف صغيرة على Mobile (9) — chips/روابط الصناعات	chip h-8 داخل صف h-11؛ فاصل 8	
P0

100	/industries	Desktop	16 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

101	/industries/السياحة-العلاجية	الكل	H1 16/24/700 — دور title/label مستخدم كعنوان صفحة	h1 → 30/42/700 (28/38 · 26/36)؛ عناوين البطاقات تبقى title 16/24/700 بوسم h2/h3	
P0

102	/industries/السياحة-العلاجية	D 44 · T 14 · M 9	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

103	/industries/السياحة-العلاجية	Mobile 9	أهداف صغيرة على Mobile (9) — chips/روابط الصناعات	chip h-8 داخل صف h-11؛ فاصل 8	
P0

104	/industries/السياحة-العلاجية	Desktop	16 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

105	/legal	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

106	/legal	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

107	/legal	Desktop	حاوية 896/864	container-reading 768 (px-6)	
P2

108	/legal/cookie-policy	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

109	/legal/cookie-policy	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

110	/legal/cookie-policy	Desktop	حاوية 896/864	container-reading 768 (px-6)	
P2

111	/legal/copyright-policy	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

112	/legal/copyright-policy	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

113	/legal/copyright-policy	Desktop	حاوية 896/864	container-reading 768 (px-6)	
P2

114	/legal/privacy-policy	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

115	/legal/privacy-policy	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

116	/legal/privacy-policy	Desktop	حاوية 896/864	container-reading 768 (px-6)	
P2

117	/legal/user-agreement	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

118	/legal/user-agreement	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

119	/legal/user-agreement	Desktop	حاوية 896/864	container-reading 768 (px-6)	
P2

120	/lucky-wheel	الكل	H1 30/36/900 — خارج السلّم، وزن 900	h1 → 30/42/700 (28/38 · 26/36)	
P1

121	/lucky-wheel	D 22 · T 1 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

122	/lucky-wheel	Desktop	حاوية 1024	container-feed 1128 أو container-reading 768	
P2

123	/modo-chat	الكل	H1 16/24/600 — دور title/label مستخدم كعنوان صفحة	h1 → 30/42/700 (28/38 · 26/36)؛ عناوين البطاقات تبقى title 16/24/700 بوسم h2/h3	
P0

124	/modo-chat	D 1 · T 1 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

125	/modo-link	الكل	H1 36/40/900 — وزن 900 ومقاس خارج السلّم	display → 40/52/700 (36/48 · 32/42)	
P1

126	/modo-link	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

127	/modonty	الكل	H1 30/38/700 — خارج السلّم	h1 → 30/42/700 (28/38 · 26/36)	
P1

128	/modonty	D 27 · T 1 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

129	/modonty	الكل	6 نصوص تحت AA — شرائح التصنيف/الوسوم على خلفية ملوّنة	نص الشريحة → #1F1F33 على tint 10% من لون الفئة؛ أو bg #0E065A + نص أبيض	
P1

130	/modonty	Desktop	22 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

131	/modonty/ai	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

132	/modonty/ai	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

133	/modonty/ai	Desktop	19 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

134	/modonty/education	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

135	/modonty/education	D 39 · T 18 · M 16	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

136	/modonty/education	Mobile 16	أهداف صغيرة على Mobile (16) — chips/روابط الصناعات	chip h-8 داخل صف h-11؛ فاصل 8	
P0

137	/modonty/education	Desktop	20 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

138	/modonty/entertainment	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

139	/modonty/entertainment	D 48 · T 27 · M 25	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

140	/modonty/entertainment	Tablet 27	أهداف صغيرة على Tablet (27) — شبكة المواعيد/البطاقات تنكمش	عناصر الشبكة ≥ 44، فاصل 8، عمودان بدل ثلاثة عند < 1024	
P0

141	/modonty/entertainment	Desktop	16 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

142	/modonty/entrepreneurship	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

143	/modonty/entrepreneurship	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

144	/modonty/entrepreneurship	Desktop	17 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

145	/modonty/football	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

146	/modonty/football	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

147	/modonty/football	Desktop	16 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

148	/modonty/health	الكل	H1 36/40/900 — وزن 900 ومقاس خارج السلّم	display → 40/52/700 (36/48 · 32/42)	
P1

149	/modonty/health	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

150	/news	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

151	/news	D 29 · T 8 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

152	/news	Desktop	حاوية 672/640	container-reading 768	
P2

153	/news/subscribe	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

154	/news/subscribe	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

155	/news/subscribe	Desktop	حاوية 672/640	container-form 480	
P2

156	/page/2	الكل	H1 16/24/700 — دور title/label مستخدم كعنوان صفحة	h1 → 30/42/700 (28/38 · 26/36)؛ عناوين البطاقات تبقى title 16/24/700 بوسم h2/h3	
P0

157	/page/2	D 36 · T 4 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

158	/page/2	الكل	1 نص تحت AA (ميتا ثانوية)	النص الثانوي → #5C5C73 (6.0:1)	
P1

159	/page/2	Desktop	18 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

160	/quran	الكل	H1 24/30/700 — خارج السلّم	h1 → 30/42/700 (28/38 · 26/36)	
P1

161	/quran	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

162	/reels	الكل	H1 14/20/700 — دور title/label مستخدم كعنوان صفحة	h1 → 30/42/700 (28/38 · 26/36)؛ عناوين البطاقات تبقى title 16/24/700 بوسم h2/h3	
P0

163	/reels	Desktop	شريط 240 وعمود فيديو بلا حاوية	عمود 225 (شريط) + مشغّل 9:16 بارتفاع 100vh−56	
P2

164	/reels/reel-mufrpspe-xr4930	الكل	H1 18/28/800 — خارج السلّم، وزن 800	h1 → 30/42/700 (28/38 · 26/36)	
P1

165	/search	الكل	H1 16/24/400 — دور title/label مستخدم كعنوان صفحة	h1 → 30/42/700 (28/38 · 26/36)؛ عناوين البطاقات تبقى title 16/24/700 بوسم h2/h3	
P0

166	/search	D 26 · T 5 · M 4	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

167	/shop	الكل	H1 24/30/700 — خارج السلّم	h1 → 30/42/700 (28/38 · 26/36)	
P1

168	/shop	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

169	/story	الكل	H1 48/48/800 — وزن 800 ومقاس خارج السلّم	display → 40/52/700 (36/48 · 32/42)	
P1

170	/story	D 25 · T 4 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

171	/story	Desktop	حاوية 896/864	container-reading 768 (px-6)	
P2

172	/story	Desktop	26 نمطاً نصياً في صفحة واحدة	الحصر في 9 أدوار؛ 12px → caption 13/20؛ 14/26 → body 16/26؛ 20/20/800 → h3 20/30/700	
P1

173	/subscribe	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

174	/subscribe	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

175	/subscribe	Desktop	حاوية 672/640	container-form 480	
P2

176	/tags	الكل	H1 48/48/900 — وزن 900 ومقاس خارج السلّم	display → 40/52/700 (36/48 · 32/42)	
P1

177	/tags	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

178	/tags	الكل	16 نصوص تحت AA — شرائح التصنيف/الوسوم على خلفية ملوّنة	نص الشريحة → #1F1F33 على tint 10% من لون الفئة؛ أو bg #0E065A + نص أبيض	
P1

179	/tags/خدمات-طبية	الكل	H1 36/40/700 — خارج السلّم	h1 → 30/42/700 (28/38 · 26/36)	
P1

180	/tags/خدمات-طبية	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

181	/tags/خدمات-طبية	الكل	4 نصوص تحت AA — شرائح التصنيف/الوسوم على خلفية ملوّنة	نص الشريحة → #1F1F33 على tint 10% من لون الفئة؛ أو bg #0E065A + نص أبيض	
P1

182	/tags/خدمات-طبية	Desktop	حاوية 1200 بجوار 1128	توحيد على 1128	
P1

183	/team	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

184	/team	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

185	/team	Desktop	حاوية 896/864	container-reading 768 (px-6)	
P2

186	/terms	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

187	/terms	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

188	/terms	Desktop	حاوية 896/864	container-reading 768 (px-6)	
P2

189	/trending	الكل	H1 30/36/700 — ارتفاع السطر 1.2 أضيق من الحد العربي	h1 → 30/42/700 (Tablet 28/38 · Mobile 26/36)	
P2

190	/trending	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

191	/trust	الكل	H1 24/32/600 — خارج السلّم، وزن 600	h1 → 30/42/700 (28/38 · 26/36)	
P1

192	/trust	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

193	/trust	Desktop	حاوية 896/864	container-reading 768 (px-6)	
P2

194	/users/forgot-password	الكل	لا يوجد H1 في الصفحة	إضافة H1 بدور h1 (30/42 · 28/38 · 26/36، وزن 700) أو sr-only إن كان العنوان مرئياً في مكوّن آخر	
P0

195	/users/forgot-password	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

196	/users/forgot-password	Desktop	حاوية 448/416	container-form 480	
P2

197	/users/login	الكل	لا يوجد H1 في الصفحة	إضافة H1 بدور h1 (30/42 · 28/38 · 26/36، وزن 700) أو sr-only إن كان العنوان مرئياً في مكوّن آخر	
P0

198	/users/login	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

199	/users/login	Desktop	حاوية 448/416	container-form 480	
P2

200	/users/notifications	الكل	لا يوجد H1 في الصفحة	إضافة H1 بدور h1 (30/42 · 28/38 · 26/36، وزن 700) أو sr-only إن كان العنوان مرئياً في مكوّن آخر	
P0

201	/users/notifications	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

202	/users/notifications	Desktop	حاوية 448/416	container-form 480	
P2

203	/users/profile	الكل	لا يوجد H1 في الصفحة	إضافة H1 بدور h1 (30/42 · 28/38 · 26/36، وزن 700) أو sr-only إن كان العنوان مرئياً في مكوّن آخر	
P0

204	/users/profile	D 24 · T 3 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

205	/users/profile	Desktop	حاوية 448/416	container-form 480	
P2

206	/users/register	الكل	لا يوجد H1 في الصفحة	إضافة H1 بدور h1 (30/42 · 28/38 · 26/36، وزن 700) أو sr-only إن كان العنوان مرئياً في مكوّن آخر	
P0

207	/users/register	D 25 · T 4 · M 2	أهداف أصغر من 24×24: روابط الفوتر 16px + breadcrumb/أزرار صغيرة	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

208	/users/register	Desktop	حاوية 448/416	container-form 480	
P2

209	/users/reset-password	الكل	لا يوجد H1 في الصفحة	إضافة H1 بدور h1 (30/42 · 28/38 · 26/36، وزن 700) أو sr-only إن كان العنوان مرئياً في مكوّن آخر	
P0

210	/users/reset-password	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

211	/users/reset-password	Desktop	حاوية 448/416	container-form 480	
P2

212	/users/verify-email	الكل	H1 20/28/600 — خارج السلّم، وزن 600	h1 → 30/42/700 (28/38 · 26/36)	
P1

213	/users/verify-email	D 23 · T 2 · M 1	أهداف أصغر من 24×24: روابط الفوتر 16px	footer a → h-8 py-2 (Mobile h-11) · breadcrumb a → py-1 px-2 · أزرار أيقونية ≥ 32 (Mobile ≥ 44)	
P0

214	/users/verify-email	Desktop	حاوية 448/416	container-form 480	
P2
