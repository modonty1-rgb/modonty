/**
 * رموز تطبيق القارئ — المصدر الوحيد لكل لون ومسافة وخطّ. لا hex ولا رقم مسافة داخل ملفّ شاشة.
 *
 * الأرقام من `documents/mobile/UIUX-RULES.md` (قيم نهائية لا مدى)، والهوية من
 * `documents/mobile/BRANDING-STANDARD.md`: الكحلي `#0E065A` · الأزرق `#3030FF` · التركواز `#00D8D8` أكسنت فقط.
 * الأسطح والنصوص = ألوان موقع مدونتي (modonty/app/globals.css :root و .dark — ٨ أكتوبر، طلب خالد: التطبيق توأم الموقع).
 * كانت منقولة من لوحة الكونسول المقيسة (`console-mobile/src/theme/tokens.ts`) — كل زوج نصّ/سطح
 * هناك مقيس ≥ ٤٫٥:١ — حتى لا تكون للماركة نسختان من نفس الدرجة.
 */

export const brandColors = {
  navy: '#0E065A',
  blue: '#3030FF',
  accent: '#00D8D8',
} as const;

const light = {
  page: '#F3F3F1',
  surface: '#FFFFFF',
  surfaceRaised: '#F5F5F5',
  surfaceHigh: '#EBEBEB',
  border: '#DBDBDB',
  text: brandColors.navy as string,
  // 7.66:1 على الأبيض · 6.20:1 على surfaceRaised.
  muted: '#5B5B5B',
  primary: brandColors.blue as string,
  onPrimary: '#FFFFFF',
  primaryContainer: '#E8E8FF',
  onPrimaryContainer: brandColors.navy as string,
  accent: brandColors.accent,
  navy: brandColors.navy,
  // التركواز الداكن: 7.37:1 على الأبيض — للنصّ التفاعلي والتعبئة البراندية في الفاتح.
  interactive: '#007575',
  brandFill: brandColors.accent,
  onBrandFill: brandColors.navy,
  danger: '#B4241A',
  dangerContainer: '#FFDAD6',
  onDangerContainer: '#7A1410',
  positiveContainer: '#C6F2F1',
  onPositiveContainer: '#00403F',
  warningContainer: '#FFE2BC',
  onWarningContainer: '#5C2E00',
  inputSurface: '#FFFFFF',
  inputBorder: '#A0A0A0',
  placeholder: '#5B5B5B',
  scrim: 'rgba(3,5,14,0.45)',
  // سطح الريلز وصفحة الفيديو داكن في الوضعين — الفيديو يُشاهَد على أسود.
  reelsBackground: '#000000',
  onReels: '#FFFFFF',
  onReelsMuted: 'rgba(255,255,255,0.88)',
  reelsScrim: 'rgba(0,0,0,0.45)',
  skeleton: '#EBEBEB',
  // ألوان بطاقات وقت القراءة في الموقع (modonty/app/globals.css — --action-listen/save/share):
  // على الماشي · فنجان قهوة · جلسة روقان، ولون النصّ فوق كلٍّ حين تُختار.
  actionListen: '#27B07D',
  onActionListen: '#FFFFFF',
  actionSave: '#F59F0A',
  onActionSave: brandColors.navy as string,
  actionShare: '#7C3BED',
  onActionShare: '#FFFFFF',
};

const dark: typeof light = {
  page: '#151519',
  surface: '#1F1F23',
  surfaceRaised: '#26262C',
  surfaceHigh: '#393842',
  border: '#302F37',
  text: '#FAFAFA',
  // 9.19:1 على surface · 8.02:1 على surfaceRaised.
  muted: '#D1D7E0',
  primary: '#5C5CFF',
  onPrimary: '#FFFFFF',
  primaryContainer: '#2A2A66',
  onPrimaryContainer: '#E2E3FF',
  accent: brandColors.accent,
  navy: brandColors.navy,
  interactive: '#00D8D8',
  brandFill: '#00D8D8',
  onBrandFill: '#0E065A',
  danger: '#FF7272',
  dangerContainer: '#43161A',
  onDangerContainer: '#FFB4B4',
  positiveContainer: '#00393A',
  onPositiveContainer: '#8AF3F2',
  warningContainer: '#3F2B06',
  onWarningContainer: '#FFCF85',
  inputSurface: '#1F1F23',
  inputBorder: '#6B6A7C',
  placeholder: '#7D87A0',
  scrim: 'rgba(3,5,14,0.6)',
  reelsBackground: '#000000',
  onReels: '#FFFFFF',
  onReelsMuted: 'rgba(255,255,255,0.88)',
  reelsScrim: 'rgba(0,0,0,0.45)',
  skeleton: '#302F37',
  actionListen: '#2ED195',
  onActionListen: brandColors.navy as string,
  actionSave: '#F6AE31',
  onActionSave: '#0E065A',
  actionShare: '#9B68F3',
  onActionShare: '#0E065A',
};

export const palettes = { light, dark };
export type AppColors = typeof light;
export type ColorScheme = keyof typeof palettes;

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

/** النصّ يكبر مع إعداد النظام حتى ١٫٣؛ تسمية التاب والشارة لا تكبران. */
export const fontScale = {
  max: 1.3,
} as const;

/** الشعار الكامل في رأس الرئيسية — نسبة الشعار الرسمي (≈ ٢٫٩:١) بارتفاع ٣٢. */
export const brandWordmark = { width: 92, height: 32 } as const;
