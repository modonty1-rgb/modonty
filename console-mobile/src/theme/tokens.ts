export type ThemeMode = 'dark' | 'light';

/**
 * لوحة «نبض» — الاتجاه «د» المعتمد (خالد، ٤ أكتوبر ٢٠٢٦؛ المصدر `console-ui-nabd.html` ‎.dD).
 *
 * بطلٌ أزرق واحد لكل شاشة · أسطح كحلية/لافندرية بلا حدود · حاويات لونية للحالة · شريط تابات
 * وقائمة على سطح شبه معتم (٩٢–٩٥٪) فلا تمويه ولا نصّ فوق زجاج. كل زوج نصّ/سطح مقيس ≥ ٤٫٥:١
 * (أدنى قيمة: الرابط على s2 الفاتح 5.97 · الأبيض على البطل 7.02 · onWarnC على warnC 9.13).
 */
function nabdDark() {
  return {
    hero: '#3030FF',
    onHero: '#FFFFFF',
    /** شكل «الكعكة» خلف رقم البطل — أفتح درجة من البطل نفسه (الأبيض عليه 5.55:1). */
    heroNumeral: '#4C4CFF',
    secondary: '#2A3290',
    onSecondary: '#E2E3FF',
    tertiary: '#00393A',
    onTertiary: '#8AF3F2',
    warningContainer: '#3F2B06',
    onWarningContainer: '#FFCF85',
    positiveContainer: '#00393A',
    onPositiveContainer: '#8AF3F2',
    dangerContainer: '#43161A',
    onDangerContainer: '#FFB4B4',
    tabBar: 'rgba(18,26,60,0.92)',
    menuSurface: 'rgba(27,36,82,0.94)',
    edgeHighlight: 'rgba(255,255,255,0.14)',
    glowBlue: '#3030FF',
    glowBlueOpacity: 0.42,
    glowTeal: '#00D8D8',
    glowTealOpacity: 0.2,
    liftShadow: '0 10px 28px rgba(0,0,0,0.32)',
    heroShadow: '0 14px 34px rgba(48,48,255,0.38)',
    scrim: 'rgba(3,5,14,0.35)',
    onHeroMuted: 'rgba(255,255,255,0.88)',
  };
}

function nabdLight() {
  return {
    hero: '#3030FF',
    onHero: '#FFFFFF',
    heroNumeral: '#5555FF',
    secondary: '#DCDDFF',
    onSecondary: '#16168F',
    tertiary: '#C6F2F1',
    onTertiary: '#00403F',
    warningContainer: '#FFE2BC',
    onWarningContainer: '#5C2E00',
    positiveContainer: '#C6F2F1',
    onPositiveContainer: '#00403F',
    dangerContainer: '#FFDAD6',
    onDangerContainer: '#7A1410',
    tabBar: 'rgba(255,255,255,0.92)',
    menuSurface: 'rgba(255,255,255,0.95)',
    edgeHighlight: 'rgba(255,255,255,0.95)',
    glowBlue: '#3030FF',
    glowBlueOpacity: 0.15,
    glowTeal: '#00D8D8',
    glowTealOpacity: 0.22,
    liftShadow: '0 10px 28px rgba(14,6,90,0.14)',
    heroShadow: '0 14px 34px rgba(48,48,255,0.28)',
    scrim: 'rgba(3,5,14,0.35)',
    onHeroMuted: 'rgba(255,255,255,0.88)',
  };
}

export const darkColors = {
  // «نبض» (٤ أكتوبر): الأسطح كحلية متدرّجة s1 → s2 → s3 بلا حدود — تباين النصوص مقيس أسفل الكتلة.
  page: '#070B16',
  surface: '#121A3C',
  surfaceRaised: '#1B2452',
  surfaceHigh: '#283166',
  border: '#283166',
  text: '#FFFFFF',
  // 9.19:1 على s1 · 8.02:1 على s2 · 6.62:1 على s3.
  muted: '#B6BEDC',
  primary: '#3030FF',
  accent: '#00D8D8',
  navy: '#0E065A',
  warning: '#FFB84D',
  danger: '#FF7272',
  textStrong: '#E9EDF5',
  textOnPrimary: '#FFFFFF',
  textInteractive: '#00D8D8',
  // 4.52:1 على `surfaceRaised`. القيمة السابقة `#75809A` قِيست 4.11:1 — تحت عتبة UIUX §٢ (4.5:1).
  inputPlaceholder: '#7D87A0',
  errorText: '#FF9A9A',
  /**
   * سطح الحقل وحدّه — منفصلان عن `surface`/`border` عمداً.
   *
   * خالد (٢٩ أغسطس): «حقول الإدخال ما هي واضحة أنها حقول إدخال». والقياس أثبته: الحقل كان
   * شفّافاً فوق البطاقة (صفر تمييز) وحدّه `#293853` = **1.38:1** على البطاقة، بينما
   * WCAG 1.4.11 «Non-text Contrast» يطلب **3:1** لحدّ أي عنصر تحكّم.
   * الحلّ طبقتان: بئر أغمق من البطاقة + حدّ يعبر 3:1.
   */
  inputSurface: '#0B1024',
  inputBorder: '#606B7F',
  /**
   * درجة «قيد التقدّم» في مسار الإحالة.
   *
   * كانت أربع مراحل (تم التواصل · اشترك · سدّد · كوفئ) تُرسم بلون واحد، فلا يرى المُحيل
   * تقدّماً أصلاً. و`primary` نفسه يرسب على البطاقة الداكنة (2.32:1)، فأُفتح إلى 4.54:1
   * مع بقاء الدرجة زرقاء براندية.
   */
  statusProgress: '#7777FF',
  /**
   * **تعبئة الماركة والنصّ فوقها** — كل سطح ممتلئ بلون الماركة: زرّ أساسي · شارة عدّاد ·
   * مربّع اختيار مؤشَّر · شريط تقدّم · رقم خطوة.
   *
   * `accent` الخام (`#00D8D8`) تركواز فاتح: يعبر على الأسطح الداكنة (9.15:1) ويسقط إلى
   * **1.58–1.66:1** على الأسطح الفاتحة — فيختفي مربّع الموافقة، وتذوب شارة التنبيهات،
   * ويبهت الزرّ الأساسي. لكل وضع درجته إذن: التركواز الفاتح داكناً، والغامق فاتحاً،
   * والصبغة البراندية واحدة. `accent` يبقى محجوزاً **لماسة الأيقونات** وحدها.
   */
  brandFill: '#00D8D8',
  onBrandFill: '#0E065A',
  /**
   * النصّ المرسوم **فوق** تعبئة `warning` (شارة «بانتظار قرارك»).
   *
   * كانت الشاشة ترسم `navy` على `warning` في الوضعين. في الداكن يعبر (10.24:1)، لكن
   * `warning` الفاتح درجة داكنة (`#B35209`) فيسقط الزوج إلى **3.46:1** — تحت 4.5:1
   * التي يفرضها WCAG 1.4.3 للنصّ الصغير. فصار لكل وضع نصّه: الكحلي على العسلي الفاتح،
   * والأبيض على البنّي الداكن (5.09:1). التعبئة ما تغيّرت — الماركة كما هي.
   */
  onWarning: '#0E065A',
  ...nabdDark(),
};

/**
 * الوضع الفاتح — أُعيد ضبطه كاملاً في ٢٩ أغسطس، وسببان اثنان لا واحد.
 *
 * **الأول: سلّم الارتفاع كان مقلوباً.** كان `page` = `#F6F8FC` **أفتح** من `surfaceRaised`
 * = `#EDF2FB`، أي أنّ «المرفوع» أغمق من أرضيّته — عكس نموذج الارتفاع في Material 3 وHIG،
 * حيث الارتفاع في الفاتح يتّجه **نحو الأبيض**. والنتيجة أنّ البطاقة كانت تُميَّز بـ:
 * تعبئة **1.06:1** وحدّ **1.25:1** — أي **بلا شيء**؛ البطاقة غير موجودة بصرياً في الفاتح.
 * الآن: أرضية مصبوغة → لوح → بطاقة بيضاء. البطاقة على الصفحة = **1.21:1**، وهو **نفس**
 * فصل الوضع الداكن بالضبط. الأمر ليس «تمرير معيار» بل تكافؤ الوضعين.
 *
 * **الثاني: كل نصوص الفاتح كانت تلامس العتبة.** `muted` 4.54 · `warning` 4.53 ·
 * `textInteractive` 4.84 على البطاقة — تعبر 4.5:1 بشعرة، بينما نظيراتها الداكنة 7.9–9.5.
 * فارق يصل إلى **٦٫٦ نقطة** يجعل الفاتح يُقرأ باهتاً وإن «نجح» في الجدول. عُمّقت الدرجات
 * إلى **6.1–7.4** فصار الوضعان متكافئين في الراحة لا في العبور فقط. الصبغة نفسها لم تتغيّر.
 */
export const lightColors = {
  // «نبض»: أرضية مصبوغة لافندر → بطاقة بيضاء → سطح ثانٍ لافندري.
  page: '#EEF0FB',
  surface: '#FFFFFF',
  surfaceRaised: '#E4E6FA',
  surfaceHigh: '#D6D9F5',
  border: '#D6D9F5',
  text: '#0E1230',
  // 7.66:1 على البطاقة البيضاء · 6.20:1 على s2 · 5.51:1 على s3.
  muted: '#4A5272',
  primary: '#3030FF',
  accent: '#00D8D8',
  navy: '#0E065A',
  // 6.66:1 نصّاً على البطاقة، و6.66:1 للأبيض فوقه تعبئةً (شارة «بانتظار قرارك»).
  warning: '#96450A',
  danger: '#B4241A',
  textStrong: '#0E1230',
  textOnPrimary: '#FFFFFF',
  textInteractive: '#0B605E',
  inputPlaceholder: '#54637A',
  errorText: '#A81E14',
  // البئر في الفاتح **أغمق** من البطاقة البيضاء — نفس منطق الداكن مقلوباً، وحدّه 4.51:1.
  inputSurface: '#EBF0F8',
  inputBorder: '#6E7787',
  // التركواز الداكن: 7.37:1 على البطاقة، والعلامة البيضاء 7.37:1 عليه.
  // الأزرق الأساسي يعبر في الفاتح كما هو.
  statusProgress: '#3030FF',
  brandFill: '#0B605E',
  onBrandFill: '#FFFFFF',
  // الأبيض على `warning` الفاتح = 6.66:1، بدل الكحلي الراسب 3.46:1.
  onWarning: '#FFFFFF',
  ...nabdLight(),
};

export const themes = {
  dark: { mode: 'dark' as const, colors: darkColors },
  light: { mode: 'light' as const, colors: lightColors },
};

/** Legacy dark palette for screens not yet migrated to the app shell. */
export const colors = darkColors;

export const fonts = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  bold: 'Tajawal_700Bold',
  /** رقم البطل وحده (الكعكة) — وزن ٨٠٠ لرقم واحد في الشاشة، كما في الموكب. */
  extraBold: 'Tajawal_800ExtraBold',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  screenHorizontal: 16,
  screenTop: 32,
  screenBottom: 24,
} as const;

export const radii = {
  field: 12,
  button: 16,
  card: 20,
} as const;

/**
 * هندسة «نبض» — أرقام الموكب المعتمد كما هي (‎.dD)، لا من سلّم ٤–٣٢ لأنها هندسة الشكل لا مسافات
 * المحتوى: زاوية البطل ٣٢ · مجموعة القائمة ٢٤ خارجياً و٨ داخلياً بفجوة ٣ · الشريط العائم ١٤ من
 * الحواف بارتفاع ٦٤ ومؤشّر ٥٢×٣٠ · القائمة المنسدلة ٢٨ وبنودها ١٤ · هامش المحتوى تحت الشريط ١٠٠.
 */
export const nabd = {
  heroRadius: 32,
  cardRadius: 24,
  tileRadius: 24,
  statRadius: 18,
  groupRadius: 24,
  groupInnerRadius: 8,
  groupGap: 4,
  pill: 999,
  heroPadding: 20,
  cookieSize: 88,
  loginCookieSize: 120,
  ringSize: 56,
  heroRingSize: 84,
  ringStroke: 6,
  heroRingStroke: 8,
  shapeSize: 40,
  rowShapeSize: 36,
  backButtonSize: 44,
  tabBarInset: 16,
  tabBarHeight: 64,
  tabBarPadding: 4,
  tabIndicatorWidth: 52,
  tabIndicatorHeight: 30,
  tabLabelGap: 4,
  tabBadgeSize: 18,
  /** الشارة فوق طرف الأيقونة الأيسر: نصف عرض المؤشّر (٢٦) من منتصف التاب. */
  tabBadgeOffset: 26,
  badgePaddingX: 12,
  statPaddingY: 12,
  rowPaddingY: 12,
  bigCardRadius: 28,
  /** المحتوى تحت الشريط العائم: ١٦ + ٦٤ + ٢٠ تنفّس — يُضاف إليه `insets.bottom`. */
  tabBarClearance: 100,
  menuRadius: 28,
  menuItemRadius: 14,
  menuWidth: 232,
  heroGlowSize: 220,
} as const;

/** الحركة — جدول الموكب: ضغط ٠٫٩٧ نابضيّ · دخول ٣٦٠ بتتابع ٤٠ (٥ عناصر) · عدّ ٥٠٠ · حلقة ٦٠٠ · قائمة ٢٠٠/١٥٠. */
export const motion = {
  pressScale: 0.97,
  pressDamping: 18,
  pressStiffness: 260,
  enterDuration: 360,
  enterStep: 40,
  enterMaxSteps: 4,
  enterOffset: 10,
  countUpDuration: 500,
  ringDuration: 600,
  menuOpen: 200,
  menuClose: 150,
  menuOffset: 8,
  tabDamping: 20,
  tabStiffness: 260,
} as const;

export const control = {
  minTouchTarget: 48,
  buttonHeight: 56,
  inputHeight: 48,
  iconSize: 24,
  /** سلّم الأيقونات: ١٢ شارة · ١٦ داخل سطر · ٢٠ سهم صفّ/زرّ · ٢٤ قياسي — لا رقم خارجه. */
  iconSizeBadge: 12,
  iconSizeInline: 16,
  iconSizeSmall: 20,
  headerIconSize: 24,
  headerHeight: 56,
  footerHeight: 64,
  clientAvatarVisualSize: 32,
  /**
   * حدّ الحقل بعرض `1` لا `StyleSheet.hairlineWidth`.
   *
   * التوثيق الرسمي يصف `hairlineWidth` بأنه «the width of a thin line on the platform… used as
   * the thickness of a **border or division between two elements**» وأنه «always a round number
   * of pixels» — أي بكسل فيزيائي واحد (≈0.57dp على كثافة 1.75×) ويحذّر أنه «should not be relied
   * upon as a constant size». فهو مقاس **فاصل**، لا مقاس حدٍّ يُعرّف عنصر تحكّم.
   * المصدر: https://reactnative.dev/docs/stylesheet#hairlinewidth
   *
   * حدّ الحقل يعرّف الحقل، فيأخذ عرضاً ثابتاً مستقلاً عن كثافة الجهاز.
   */
  inputBorderWidth: 1,
} as const;

export const brand = {
  wordmarkWidth: 124,
  wordmarkHeight: 43,
} as const;

/** Article media keeps the existing approved review-screen geometry. */
export const media = {
  articleHeroHeight: 200,
  cardImageAspectRatio: 16 / 9,
  thumbnailSize: 64,
  /**
   * مصغّرة صفّ بطاقة المقال.
   *
   * كانت الصورة بانراً 16:9 بارتفاع 195dp، فصارت البطاقة 403dp = **٧٢٪ من الشاشة المرئية**
   * (٥٥٧dp بعد الرأس والتابات ورأس القائمة) — أي أنّ طابور القرارات لا يُمسح بالعين:
   * بمقالين تنتظران قراراً لا يظهر الثاني أصلاً. والبانر تسويقيّ للعميل ولا يدخل في القرار،
   * فالقرار من العنوان والطول وعدد الأسئلة.
   */
  rowThumbnailSize: 80,
  /**
   * عرض مصغّرة صفّ الفيديو — مقيسٌ على ارتفاع نصّه لا مُختار.
   *
   * عمود النصّ ثلاثة أسطر = ٧٣dp (حالة ٢٠ + عنوان ٢٣+٨ + بيانات ١٨+٤). وبنسبة ١٦:٩
   * يعطي العرض ١٢٨ ارتفاعاً ٧٢ — فتتحاذى الصورة والنصّ ولا يبقى فراغ ميّت.
   *
   * ولا يصلح هنا `alignSelf: 'stretch'` مع `aspectRatio`: قِيس أنّ الحاوية تنهار إلى
   * **1×0** لأنّ التمدّد يضبط الارتفاع ولا يُشتَقّ منه العرض.
   */
  videoThumbnailWidth: 128,
  avatarSize: 48,
} as const;

/**
 * هندسة **نصّ المقال المُرسَّم** — نصّ القارئ، لا هيكل التطبيق.
 *
 * مجموعة مستقلّة لأنّ الشريط استعار `control.inputBorderWidth` وهو موثَّق فوقه بأنه
 * «حدّ الحقل يعرّف الحقل» — دلالةٌ أخرى تماماً. وعند `1` لا يُفرَّق شريط الاقتباس عن
 * فاصلٍ شعريّ، فيفقد الاقتباس علامته الوحيدة أنه اقتباس.
 */
export const articleContent = {
  quoteBarWidth: 3,
} as const;

/** Skeleton bars mirror the real content they stand in for. */
export const skeleton = {
  lineHeight: 12,
  titleHeight: 20,
  blockHeight: 96,
  cardHeight: 160,
  opacity: 0.35,
} as const;

export const typography = {
  body: 15,
  label: 13,
  title: 18,
  pageTitle: 18,
  sectionTitle: 16,
  secondary: 12,
  tabLabel: 11,
  lineHeightBody: 23,
  lineHeightLabel: 20,
  lineHeightTitle: 26,
  lineHeightPageTitle: 26,
  lineHeightSection: 24,
  lineHeightSecondary: 18,
  lineHeightTabLabel: 16,
  // «نبض»: العنوان الكبير ٢٨/٣٦ وعنوان البطل ٢٠/٢٨ والأرقام — رقم ٨٠٠ واحد فقط في الشاشة (رقم البطل).
  largeTitle: 28,
  lineHeightLargeTitle: 36,
  heroTitle: 20,
  lineHeightHeroTitle: 28,
  cookieNumeral: 48,
  lineHeightCookieNumeral: 56,
  ringNumeral: 15,
  heroRingNumeral: 24,
  lineHeightRingNumeral: 18,
  tileNumeral: 30,
  lineHeightTileNumeral: 34,
  mediumTitle: 24,
  lineHeightMediumTitle: 32,
  statNumeral: 24,
  lineHeightStatNumeral: 30,
} as const;

/** Text grows with the phone setting up to 1.3× (accessibility); compact chrome (tabs, badges, ring numerals) stays at 1 on its own. */
export const fontScale = {
  uiMaxMultiplier: 1.3,
} as const;
