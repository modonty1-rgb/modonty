export type ThemeMode = 'dark' | 'light';

export const darkColors = {
  page: '#070B14',
  surface: '#101827',
  surfaceRaised: '#152036',
  border: '#293853',
  text: '#FFFFFF',
  muted: '#A9B6CC',
  primary: '#35E1DE',
  navy: '#2518E8',
  warning: '#FFB84D',
  danger: '#FF7272',
  textStrong: '#E9EDF5',
  textOnPrimary: '#06131A',
  textInteractive: '#7EEFED',
  inputPlaceholder: '#75809A',
  errorText: '#FF9A9A',
};

export const lightColors = {
  page: '#F6F8FC',
  surface: '#FFFFFF',
  surfaceRaised: '#EDF2FB',
  border: '#D6E0F0',
  text: '#101827',
  muted: '#64748B',
  primary: '#0E9F9C',
  navy: '#0E065A',
  warning: '#B45309',
  danger: '#D92D20',
  textStrong: '#101827',
  textOnPrimary: '#FFFFFF',
  textInteractive: '#0E7674',
  inputPlaceholder: '#64748B',
  errorText: '#B42318',
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

export const control = {
  minTouchTarget: 48,
  buttonHeight: 56,
  inputHeight: 48,
  iconSize: 20,
  headerHeight: 56,
} as const;

/** Article media keeps the existing approved review-screen geometry. */
export const media = {
  articleHeroHeight: 200,
} as const;

export const typography = {
  body: 14,
  label: 14,
  title: 20,
  pageTitle: 18,
  sectionTitle: 16,
  secondary: 12,
  tabLabel: 11,
  lineHeightBody: 20,
  lineHeightTitle: 28,
  lineHeightPageTitle: 26,
  lineHeightSection: 24,
  lineHeightSecondary: 18,
  lineHeightTabLabel: 16,
} as const;
