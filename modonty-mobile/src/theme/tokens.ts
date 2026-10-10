/**
 * رموز تطبيق القارئ — المصدر الوحيد لكل لون ومسافة وخطّ. لا hex ولا رقم مسافة داخل ملفّ شاشة.
 *
 * المصدر: نظام تصميم مدونتي ١٫٠ (Claude Design، ٩ أكتوبر ٢٠٢٦) — نسخة محلية في
 * `documentation/design-system/Modonty Tokens.dc.html` · قواعد المنصّتين: `documentation/PLATFORM-RULES.html`.
 * كل زوج نصّ/سطح مقيس ≥ ٤٫٥:١ في الصفحة نفسها. الهوية: الكحلي `#0E065A` · الأزرق `#3030FF` · التركواز أكسنت تعبئة فقط.
 * الأساسات مشتركة لكل تطبيقات مدونتي على الجوال (قرار خالد ٩ أكتوبر).
 *
 * الأسماء القديمة (page · surface · surfaceRaised …) باقية بقيم النظام الجديد حتى تنتقل الشاشات واحدة واحدة.
 */

export const brandColors = {
  navy: '#0E065A',
  blue: '#3030FF',
  accent: '#00D8D8',
} as const;

/** ألوان وظيفية ثابتة في الوضعين (Tokens §٠٥): التعبئة لون الموقع، والنصّ فوقها خاصّ بها. */
const functional = {
  // مدّة القراءة · read.go/coffee/long
  actionListen: '#27B07D',
  onActionListen: '#06291C',
  actionSave: '#F59F0A',
  onActionSave: '#3A2300',
  actionShare: '#7C3BED',
  onActionShare: '#FFFFFF',
  whatsapp: '#25D366',
  onWhatsapp: '#06291C',
  gold: '#E0A100',
  brandImmersive: brandColors.navy as string,
  // سطح الطلّات داكن في الوضعين — الفيديو يُشاهَد على أسود.
  reelsBackground: '#000000',
  onReels: '#FFFFFF',
  onReelsMuted: 'rgba(255,255,255,0.88)',
  reelsScrim: 'rgba(0,0,0,0.45)',
};

const light = {
  ...functional,
  // Tokens §٠٤ فاتح
  page: '#FAF9F6', // bg.page
  sunken: '#F3F3F1', // bg.sunken
  surface: '#FFFFFF', // surface.1
  surfaceRaised: '#F3F3F1', // surface.2
  surfaceHigh: '#ECEBE7', // surface.3
  border: '#E6E4DE', // border.subtle
  borderStrong: '#CFCCC4', // border.strong
  text: brandColors.navy as string, // text.primary 15.85:1
  textSecondary: '#4A4670', // 7.87:1
  muted: '#625F82', // text.muted 5.06:1 (أسوأ حالة surface.3)
  primary: brandColors.blue as string, // 7.02:1 مع الأبيض
  primaryText: brandColors.blue as string, // 6.32:1
  onPrimary: '#FFFFFF',
  primaryContainer: '#E8E8FF',
  onPrimaryContainer: brandColors.navy as string,
  accent: brandColors.accent, // تعبئة فقط — ممنوع كنصّ في الفاتح
  navy: brandColors.navy,
  interactive: '#007575', // accent.text 4.97:1
  accentContainer: '#CCF5F5',
  brandFill: brandColors.accent,
  onBrandFill: brandColors.navy,
  success: '#1C7A55',
  successContainer: '#E2F4EC',
  warning: '#9A5800',
  danger: '#C2261F',
  dangerContainer: '#FDE6E4',
  onDangerContainer: '#7A1410',
  positiveContainer: '#E2F4EC',
  onPositiveContainer: '#1C7A55',
  warningContainer: '#FDF0D9',
  onWarningContainer: '#9A5800',
  goldText: '#7A5A00',
  inputSurface: '#FFFFFF',
  // حدّ الحقل: يبقى ≥ ٣:١ على الأبيض (WCAG 1.4.11) — border.strong في النظام أفتح من ذلك.
  inputBorder: '#8E8BA6',
  placeholder: '#625F82',
  scrim: 'rgba(14,6,90,0.48)',
  skeleton: '#ECEBE7',
  pressOverlay: 'rgba(14,6,90,1)', // ink text.primary — الشفافية من motion.press.overlay
};

const dark: typeof light = {
  ...functional,
  // Tokens §٠٤ داكن
  page: '#151519',
  sunken: '#1B1B20',
  surface: '#1F1F23',
  surfaceRaised: '#28282E',
  surfaceHigh: '#323238',
  border: '#2E2E35',
  borderStrong: '#45454E',
  text: '#F2F1F7', // 11.34:1
  textSecondary: '#B8B6CB',
  muted: '#9C9AB0', // 4.65:1
  primary: '#5C5CFF', // تعبئة أفتح لتتميّز عن bg.page (3.84:1) · أبيض فوقها 4.74:1
  primaryText: '#9C9CFF',
  onPrimary: '#FFFFFF',
  primaryContainer: '#26265E',
  onPrimaryContainer: '#E2E3FF',
  accent: brandColors.accent,
  navy: brandColors.navy,
  interactive: '#00D8D8', // مسموح كنصّ في الداكن 9.24:1
  accentContainer: '#0F3A3D',
  brandFill: '#00D8D8',
  onBrandFill: '#0E065A',
  success: '#5BD69F',
  successContainer: '#133D2C',
  warning: '#FFBE4D',
  danger: '#FF8A80',
  dangerContainer: '#4A1F1C',
  onDangerContainer: '#FFB4B4',
  positiveContainer: '#133D2C',
  onPositiveContainer: '#5BD69F',
  warningContainer: '#3D2C0C',
  onWarningContainer: '#FFBE4D',
  goldText: '#E9C46A',
  inputSurface: '#1F1F23',
  inputBorder: '#6B6A7C',
  placeholder: '#9C9AB0',
  scrim: 'rgba(0,0,0,0.56)',
  skeleton: '#323238',
  pressOverlay: 'rgba(255,255,255,1)',
};

export const palettes = { light, dark };
export type AppColors = typeof light;
export type ColorScheme = keyof typeof palettes;

/** قطاعات «عالم مدونتي» (Tokens §٠٥ — OKLCH، بعيدة ≥ ٢٦° عن كل دور حالة). نصّ أبيض فوق كلٍّ ≥ ٤٫٥. */
export const sectorColors = {
  entrepreneurship: { light: '#636109', dark: '#787618' },
  football: { light: '#376E00', dark: '#478416' },
  education: { light: '#166687', dark: '#0A7CA6' },
  ai: { light: '#7241A0', dark: '#8656B7' },
  entertainment: { light: '#8B3682', dark: '#A24B98' },
  health: { light: '#9B2E5D', dark: '#B34471' },
} as const;

/** سلّم المسافة الوحيد: ٤ · ٨ · ١٢ · ١٦ · ٢٠ · ٢٤ · ٣٢ (UIUX §٣). */
export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  /** حافة الشاشة. */
  screen: 16,
  /** بين بطاقات القائمة. */
  listGap: 12,
  /** داخل البطاقة. */
  card: 16,
  /** بين قسم وقسم. */
  section: 16,
  /** بين تسمية وحقلها. */
  label: 8,
} as const;

/** الزوايا (UIUX §٣): حقل ١٢ · زرّ ١٦ · بطاقة ٢٠ · صورة داخل بطاقة ١٢. */
export const radius = {
  field: 12,
  button: 16,
  card: 20,
  image: 12,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  bold: 'Tajawal_700Bold',
} as const;

/** جدول الخطوط النهائي (UIUX §٤) — ٧٠٠ لرقم واحد أو قرار حرج واحد فقط. */
export const typography = {
  pageTitle: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 30 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 26 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23 },
  label: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 20 },
  secondary: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18 },
  tabLabel: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16 },
  /** نصّ المقال المقروء — نفس دور «نصّ» (١٥/٢٣) بارتفاع سطر قراءة أطول داخل المتن فقط. */
  reading: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 29 },
  /** رقم بارز واحد في الشاشة. */
  numeral: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 26 },
} as const;
export type TypeRole = keyof typeof typography;

/** أهداف اللمس والهيكل (UIUX §١ و§٥). */
export const control = {
  touch: 48,
  icon: 24,
  iconInline: 16,
  iconSmall: 20,
  buttonHeight: 48,
  inputHeight: 48,
  header: 56,
  footer: 64,
  avatar: 40,
  avatarLarge: 72,
  logo: 48,
  border: 1,
  iconLarge: 32,
  stateBadge: 64,
} as const;

export const media = {
  /** صورة المقال: ١٦:٩ دائماً (UIUX §٣ — معيار صورة المقال). */
  articleAspect: 16 / 9,
  thumbWidth: 112,
  /** الريل عمودي ٩:١٦. */
  reelAspect: 9 / 16,
  partnerHeroAspect: 16 / 9,
} as const;

/** الحركة (UIUX §٧): ٢٠٠ للعناصر الصغيرة · ٣٠٠ للانتقال · أثر ضغطة خلال ١٠٠. */
export const motion = {
  small: 200,
  screen: 300,
  pressFeedback: 100,
  pressedOpacity: 0.72,
} as const;

/**
 * النصّ يكبر مع إعداد خطّ الجوال حتى ١٫٢ فقط (خالد ١٠ أكتوبر: جواله على ١٫٥ فبدا التطبيق كبيراً بلا تناسق).
 * سقف واحد للتطبيق كلّه يحفظ نسب واجهة الجوال؛ ومن يريد خطّ قراءة أكبر يرفعه من «Aa» في المقال.
 */
export const fontScale = {
  max: 1.2,
} as const;

/** الشعار الكامل في رأس الرئيسية — نسبة الشعار الرسمي (≈ ٢٫٩:١) بارتفاع ٣٢. */
export const brandWordmark = { width: 92, height: 32 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// نظام التصميم ١٫٠ (Tokens §٠١–١٠) — الشاشات الجديدة تقرأ من هنا فقط. القديم أعلاه يُحذف حين تنتقل آخر شاشة.
// ─────────────────────────────────────────────────────────────────────────────

/** §٠١ المسافات — وحدة ٤dp. */
export const ds = {
  space: { s0: 0, s1: 4, s2: 8, s3: 12, s4: 16, s5: 20, s6: 24, s8: 32, s10: 40, s12: 48, s16: 64 },
  /** §٠٢ الزوايا — feature = «مميّز اليوم» فقط (٢٨ والزاوية الحادّة ٨ أعلى البداية). */
  radius: { xs: 6, sm: 10, md: 14, ml: 16, lg: 20, xl: 28, full: 999, feature: { round: 28, sharp: 8 } },
  /** §٠٩ التخطيط — مرجع ٣٦٠×٨٠٠dp. الإزاحات تُجمع مع safe area. */
  layout: {
    gutter: 16,
    section: 32,
    gridGap: 12,
    rowGap: 12,
    navHeight: 56,
    island: 56,
    navInset: 12,
    navGap: 8,
    contentBottomInset: 88, // 12 + 56 + 20
    miniPlayer: 56,
    miniPlayerInset: 152,
    navMaxWidth: 272,
    appbarCollapsed: 56,
    sheetMaxHeight: 0.88,
    maxContent: 600,
    wideBreakpoint: 840,
  },
  /** §٠٨ مساحات اللمس — الحدّ الأدنى ٤٨ للنظامين (Android أشدّ من Apple 44). الفرق بـhitSlop. */
  touch: { min: 48, iconButton: 40, chip: 36, button: 52, navItem: 56, row: 56, reelAction: 44, reelActionHit: 52 },
  /** §٠٧ الأيقونات — Lucide مؤقّتاً، ثم مجموعة البراند على نفس الشبكة. */
  icon: { inline: 20, base: 24, reel: 28, stroke: 1.75 },
  /** §٠٦ الارتفاع — ظلال فقط (لا blur). في الداكن الارتفاع من درجة السطح. */
  elevation: { flat: 0, card: 1, floating: 6, overlay: 12 },
} as const;

/** أوزان Tajawal الخمسة (§٠٣) — تُحمَّل في app/_layout.tsx. */
export const dsFonts = {
  w400: 'Tajawal_400Regular',
  w500: 'Tajawal_500Medium',
  w700: 'Tajawal_700Bold',
  w800: 'Tajawal_800ExtraBold',
  w900: 'Tajawal_900Black',
} as const;

/** §٠٣ سلّم الخطوط — size/lineHeight بالـdp وتكبر مع إعداد النظام (حتى ٢٠٠٪). أصغر حجم ١٢. */
export const dsType = {
  display: { fontFamily: dsFonts.w900, fontSize: 34, lineHeight: 44 },
  headline: { fontFamily: dsFonts.w800, fontSize: 28, lineHeight: 38 },
  titleLg: { fontFamily: dsFonts.w800, fontSize: 22, lineHeight: 32 },
  titleMd: { fontFamily: dsFonts.w700, fontSize: 18, lineHeight: 28 },
  titleSm: { fontFamily: dsFonts.w700, fontSize: 16, lineHeight: 24 },
  reader: { fontFamily: dsFonts.w400, fontSize: 18, lineHeight: 36 },
  body: { fontFamily: dsFonts.w400, fontSize: 16, lineHeight: 28 },
  bodySm: { fontFamily: dsFonts.w400, fontSize: 14, lineHeight: 22 },
  labelLg: { fontFamily: dsFonts.w700, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: dsFonts.w700, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: dsFonts.w500, fontSize: 12, lineHeight: 18 },
} as const;
export type DsTypeRole = keyof typeof dsType;

/**
 * §١٠ الحركة — المصدر الوحيد. `reduced` = القيمة حين يفعّل المستخدم Reduce Motion (iOS) أو Remove animations (Android)،
 * تُكشف بـ `useReducedMotion()` من Reanimated.
 */
export const dsMotion = {
  tabSpring: { damping: 16, stiffness: 220, mass: 1 },
  navCollapse: { duration: 220, bezier: [0.2, 0, 0, 1], threshold: 24 },
  tabRetap: { duration: 300 },
  sheetOpen: { duration: 300, bezier: [0.05, 0.7, 0.1, 1] },
  sheetClose: { duration: 200, bezier: [0.3, 0, 0.8, 0.15] },
  scrim: { duration: 200, opacityLight: 0.48, opacityDark: 0.56 },
  pressIn: { duration: 100, scale: { default: 0.97, row: 1, tabIcon: 0.92, activeTab: 0.96 } },
  pressOut: { damping: 20, stiffness: 300 },
  pressOverlay: { row: 0.06, card: 0.08, tab: 0.1, chip: 0.12, button: 0.12, activeTab: 0.16 },
  listenMorph: { layout: 280, crossfade: 150 },
  appbar: { duration: 180, translateY: 8, trigger: 250 },
  skeleton: { loop: 1400, swap: 150 },
  reelPause: { duration: 150, scaleFrom: 0.8 },
  reelLike: { burst: 900, pulseFrom: 1.2 },
  toast: { enter: 200, exit: 150, translateY: 16, show: 4000, showError: 8000 },
  offline: { showAfter: 2000, backOnline: 2000, collapse: 220 },
  modoStream: { cursorBlink: 1000, dots: 1200, stagger: 150 },
  /** البديل الموحّد مع تقليل الحركة: تلاشٍ قصير بلا انزلاق ولا تكبير. */
  reducedFade: 150,
} as const;

/** تكبير الخطّ: النظامان يسمحان حتى ٢٠٠٪ (Apple HIG · Android 14). من ١٫٣ فما فوق: الكبسولة أيقونات فقط. */
export const dsFontScale = { max: 1.2 } as const;
