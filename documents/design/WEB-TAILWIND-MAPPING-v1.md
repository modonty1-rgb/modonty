# Tailwind mapping — v1 (Claude Design · 9 Oct 2026)

> Source: Claude Design project «Modonty Web Standard v1». Text extracted from the design file.

المعيار
قائمة الإصلاحات
Tailwind mapping
قبل / بعد
خطة التطبيق
Tailwind mapping — جاهز للصق

يُلصق في tailwind.config.ts تحت theme.extend. المقاسات المتجاوبة للأدوار الأربعة الأولى تُنفَّذ كمكوّنات (@layer components) لأن fontSize لا يقبل قيماً لكل نقطة توقف.

1 · theme.extend
// tailwind.config.ts
screens: { sm: '390px', md: '768px', lg: '1024px', xl: '1280px' },
fontFamily: { sans: ['Tajawal', 'system-ui', 'sans-serif'] },
fontWeight: { normal: '400', medium: '500', bold: '700' }, // 600/800/900 removed on purpose

fontSize: {
  // mobile-first value; display/h1/h2/h3 scale up via .text-* components below
  display: ['32px', { lineHeight: '42px', fontWeight: '700' }],
  h1:      ['26px', { lineHeight: '36px', fontWeight: '700' }],
  h2:      ['20px', { lineHeight: '30px', fontWeight: '700' }],
  h3:      ['18px', { lineHeight: '28px', fontWeight: '700' }],
  title:   ['16px', { lineHeight: '24px', fontWeight: '700' }],
  'body-lg': ['17px', { lineHeight: '30px', fontWeight: '400' }],
  body:    ['16px', { lineHeight: '26px', fontWeight: '400' }],
  label:   ['14px', { lineHeight: '20px', fontWeight: '500' }],
  caption: ['13px', { lineHeight: '20px', fontWeight: '400' }], // minimum
},

spacing: { 0:'0', 1:'4px', 2:'8px', 3:'12px', 4:'16px', 5:'20px', 6:'24px',
           8:'32px', 10:'40px', 11:'44px', 12:'48px', 14:'56px', 16:'64px',
           rail:'225px', feed:'555px', aside:'300px' },

borderRadius: { none:'0', sm:'4px', md:'8px', lg:'12px', xl:'16px', full:'9999px' },

boxShadow: {
  e1: '0 1px 2px rgba(14,6,90,0.06)',
  e2: '0 4px 12px rgba(14,6,90,0.10)',
  e3: '0 8px 24px rgba(14,6,90,0.16)',
},

maxWidth: { feed:'1128px', reading:'768px', form:'480px', prose:'680px' },

gridTemplateColumns: {
  shell:    '225px 555px 300px',   // xl  (RTL: rail · feed · aside)
  'shell-lg': '225px minmax(0,1fr)', // lg (feed max 600 inside)
},

colors: {
  brand: { DEFAULT:'#3030FF', navy:'#0E065A', teal:'#00D8D8' },
  ink:   { DEFAULT:'#0E065A', muted:'#5B5B5B' },
  page:  '#F3F2EF',
  line:  'rgba(0,0,0,0.08)',
},
outlineColor: { brand: '#3030FF' },
/* globals.css — responsive heading roles + shell */
@layer components {
  .text-display { @apply text-[32px] leading-[42px] font-bold md:text-[36px] md:leading-[48px] xl:text-[40px] xl:leading-[52px]; }
  .text-h1      { @apply text-[26px] leading-[36px] font-bold md:text-[28px] md:leading-[38px] xl:text-[30px] xl:leading-[42px]; }
  .text-h2      { @apply text-[20px] leading-[30px] font-bold md:text-[22px] md:leading-[32px] xl:text-[24px] xl:leading-[34px]; }
  .text-h3      { @apply text-[18px] leading-[28px] font-bold xl:text-[20px] xl:leading-[30px]; }
  .text-body-lg { @apply text-[17px] leading-[30px] md:text-[18px] md:leading-[32px]; }

  .container-feed    { @apply mx-auto w-full max-w-feed px-4 md:px-6; }
  .container-reading { @apply mx-auto w-full max-w-reading px-4 md:px-6; }
  .container-form    { @apply mx-auto w-full max-w-form px-4; }
  .shell { @apply container-feed grid gap-2 lg:grid-cols-shell-lg lg:gap-6 xl:grid-cols-shell; }
  .shell > aside:last-child { @apply hidden xl:block; }       /* 300 rail */
  .shell > aside:first-child { @apply hidden lg:block; }      /* 225 rail */

  .card { @apply bg-white border border-line shadow-e1 rounded-none md:rounded-md p-4 flex flex-col gap-3; }
  .focus-ring { @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand; }
  .target { @apply min-h-6 min-w-6 md:min-h-8 max-md:min-h-11; }
}
html { letter-spacing: 0; }
2 · جدول الترحيل — القيم المقاسة → الصنف الجديد
الفئة	القيمة/الصنف القديم (القياس)	العدد	الصنف الجديد	ملاحظة
Type	text-xs 12/16 · 12/15 · 12/20 · 12/12	×3,100+	text-caption 13/20	الحد الأدنى. إن كان رابطاً أو زراً → text-label
text-sm 14/20 (400/500)	×1,081	text-label 14/20/500 أو text-body 16/26	سطر واحد → label · فقرة → body
text-sm leading-[26px] 14/26	×520	text-body 16/26	نص بطاقات التغذية
text-base 16/24 (400/500/600/700)	×618	text-body أو text-title (700)	600 → 700
text-lg leading-[33px] 18/33	×89	text-body-lg 18/32	متن المقال
text-xl leading-5 font-extrabold 20/20/800	×260	text-h3 20/30/700	أرقام الإحصاءات في البطاقات
text-xl 20/28 · text-2xl 24/30 · 24/32	×178	text-h2 24/34	
text-3xl 30/36 · 30/38 · 28/32 · 26/33	×72	text-h1 30/42	H1 واحد فقط في الصفحة
text-4xl 36/40 · text-5xl 48/48 · 40/50	×12	text-display 40/52	صفحات الهبوط فقط
Weight	font-semibold 600	×540	font-bold 700	Tajawal لا يحوي 600
font-extrabold 800 · font-black 900	×275	font-bold 700	
Radius	rounded-sm 2 · rounded-[3px] · rounded 4	×81	rounded-sm 4	
rounded-md 6 · rounded-lg 8	×588	rounded-md 8	بطاقات، حقول
rounded-xl 12 · rounded-[14px]	×203	rounded-lg 12	أغلفة، ريلز
rounded-2xl 16 · rounded-[20px] · rounded-3xl 24 · 32 · rounded-t-2xl	×226	rounded-xl 16 · rounded-t-xl	حوارات، أوراق سفلية
rounded-[28%]	×60	rounded-md 8 (شعار شركة) أو rounded-full (شخص)	
Icons	h-2.5 w-2.5 10 · h-3 w-3 12 · size-[15px]	×100	size-4 16 — M16	stroke 1.25
h-[18px] w-[18px] · size-[18px]	×55	size-5 20	
h-4 w-4 · h-5 w-5 · h-6 w-6	×2,171	size-4 · size-5 · size-6	تبقى؛ توحيد الصيغة فقط
28 / 32 / 40 / 48 / 56 (صور ملف)	×71	size-6 · size-8 · size-12 · size-[72px] · size-32	سلّم Avatar
Buttons	h-5 rounded 20/4 · h-6 24 · h-7 28	×97	Button size="sm" h-8 rounded-full	Mobile h-9 داخل صف 44
h-9 rounded-full/rounded-lg 36	×169	Button size="sm" h-8 أو "md" h-10	
h-10 rounded-full · h-10 rounded-xl	×374	Button size="md" h-10 rounded-full	Mobile h-11
h-11 rounded-full/lg/none 44	×192	Button size="md" (Mobile) أو "lg" h-12	
h-12 rounded-full 48	×321	Button size="lg" h-12 rounded-full	يبقى
h-[68/113/198/293] (بطاقات قابلة للنقر بوسم button)	×61	<a class="card focus-ring">	ليست أزراراً
Targets	footer a 16px	×23/صفحة	text-label inline-flex items-center h-8 py-2 max-md:h-11	P0
partner contact a 20px	×13 صفحة	flex items-center gap-3 h-10 px-4 text-body	list row
breadcrumb a		text-label py-1 px-2 rounded-sm	الصف h-8
icon-only button بلا حجم		Button size="icon" size-10 (Mobile size-11)	
Colour	bg-teal text-white (دخول 1.43:1)	×13	bg-brand text-white أو bg-brand-teal text-ink	P0
text-gray-500/400 ، text-muted-foreground متفرّقة		text-ink-muted #5B5B5B	6.4:1 على #F3F2EF
Containers	max-w-4xl 896 · max-w-3xl 768 · 1024		container-reading 768	
max-w-2xl 672 · max-w-md 448		container-form 480 (نماذج) · container-reading (نصوص)	
max-w-[1216px] · 1200 · 1270/1280		container-feed 1128 / .shell	
3 · shadcn/ui — تغييرات الـvariants
// components/ui/button.tsx — cva size variants
size: {
  sm:   'h-8 px-3 text-label gap-2 [&_svg]:size-4 max-md:h-9',
  md:   'h-10 px-4 text-label font-bold gap-2 [&_svg]:size-5 max-md:h-11',   // default
  lg:   'h-12 px-6 text-[16px] leading-6 font-bold gap-2 [&_svg]:size-5',
  icon: 'size-10 [&_svg]:size-5 max-md:size-11',
  'icon-sm': 'size-8 [&_svg]:size-4 max-md:size-11',
},
// base: 'rounded-full font-medium focus-ring' — remove rounded-md / h-9 / text-sm defaults

// input.tsx + select.tsx trigger
'h-10 max-md:h-11 rounded-md px-3 text-body'   // was h-9/h-10 rounded-md text-sm
// label.tsx → 'text-label'; FormDescription/FormMessage → 'text-caption'

// badge.tsx (chips/tags)
'h-8 px-3 rounded-full text-label inline-flex items-center gap-2 [&_svg]:size-4'  // was h-5 text-xs rounded-md

// card.tsx
Card:        'card'                      // bg-white border-line shadow-e1 rounded-none md:rounded-md p-4 gap-3
CardHeader:  'flex items-center gap-3 p-0'
CardTitle:   'text-title'                // was text-2xl font-semibold leading-none
CardDescription: 'text-caption text-ink-muted'
CardContent: 'p-0 text-body'

// avatar.tsx: sizes 24 · 32 · 48 · 72 · 128 → size-6 size-8 size-12 size-[72px] size-32
// dialog.tsx / sheet.tsx: rounded-xl shadow-e3 ; DialogTitle → text-h3
// dropdown-menu / popover: rounded-md shadow-e2 ; items h-10 text-label (max-md:h-11)
// breadcrumb.tsx: BreadcrumbLink 'text-label py-1 px-2 rounded-sm focus-ring'