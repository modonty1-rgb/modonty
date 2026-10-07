import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { configureFonts, MD3DarkTheme, MD3LightTheme, PaperProvider, type MD3Theme } from 'react-native-paper';

import { ModontyIcon, type ModontyIconName } from '@/components/brand/ModontyIcon';
import { palettes, radius, typography, type AppColors, type ColorScheme } from './tokens';

type AppTheme = { scheme: ColorScheme; colors: AppColors };
const ThemeContext = createContext<AppTheme | null>(null);

/**
 * خطّ Paper كلّه Tajawal وبأحجام جدول UIUX §٤ — لا يبقى دور طباعي على خطّ النظام ولا حجم خارج الجدول.
 * الأوزان ٤٠٠/٥٠٠ فقط (٧٠٠ يُستعمل يدوياً لرقم واحد؛ ٣٠٠ و١٠٠ ممنوعان).
 */
function role(r: (typeof typography)[keyof typeof typography], weight: '400' | '500') {
  return { fontFamily: r.fontFamily, fontSize: r.fontSize, lineHeight: r.lineHeight, fontWeight: weight, letterSpacing: 0 };
}
const paperFonts = configureFonts({
  config: {
    displayLarge: role(typography.pageTitle, '500'),
    displayMedium: role(typography.pageTitle, '500'),
    displaySmall: role(typography.pageTitle, '500'),
    headlineLarge: role(typography.pageTitle, '500'),
    headlineMedium: role(typography.pageTitle, '500'),
    headlineSmall: role(typography.pageTitle, '500'),
    titleLarge: role(typography.pageTitle, '500'),
    titleMedium: role(typography.sectionTitle, '500'),
    titleSmall: role(typography.label, '500'),
    labelLarge: role(typography.label, '500'),
    labelMedium: role(typography.label, '500'),
    labelSmall: role(typography.tabLabel, '500'),
    bodyLarge: role(typography.body, '400'),
    bodyMedium: role(typography.body, '400'),
    bodySmall: role(typography.secondary, '400'),
    default: role(typography.body, '400'),
  },
});

/** ثيم Paper من رموز مدونتي — Paper يعطي السلوك، والألوان كلّها من `tokens` (BRANDING: لا ألوان Material). */
function paperTheme(scheme: ColorScheme, c: AppColors): MD3Theme {
  const base = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    dark: scheme === 'dark',
    roundness: radius.field / 4,
    fonts: paperFonts,
    colors: {
      ...base.colors,
      primary: c.primary,
      onPrimary: c.onPrimary,
      primaryContainer: c.primaryContainer,
      onPrimaryContainer: c.onPrimaryContainer,
      secondary: c.interactive,
      onSecondary: c.onBrandFill,
      secondaryContainer: c.surfaceRaised,
      onSecondaryContainer: c.text,
      tertiary: c.brandFill,
      onTertiary: c.onBrandFill,
      background: c.page,
      onBackground: c.text,
      surface: c.surface,
      onSurface: c.text,
      surfaceVariant: c.surfaceRaised,
      onSurfaceVariant: c.muted,
      outline: c.inputBorder,
      outlineVariant: c.border,
      error: c.danger,
      onError: c.onPrimary,
      errorContainer: c.dangerContainer,
      onErrorContainer: c.onDangerContainer,
      backdrop: c.scrim,
      elevation: {
        level0: 'transparent',
        level1: c.surface,
        level2: c.surfaceRaised,
        level3: c.surfaceRaised,
        level4: c.surfaceHigh,
        level5: c.surfaceHigh,
      },
    },
  };
}

/** أيقونات مكوّنات Paper الداخلية (إغلاق الشريحة، سهم القائمة) تُرسم بـModontyIcon لا بخطّ أيقونات Material. */
const PAPER_ICON_MAP: Record<string, ModontyIconName> = {
  close: 'close',
  'close-circle': 'close',
  check: 'check',
  magnify: 'search',
  'arrow-left': 'back',
  'arrow-right': 'forward',
  'chevron-left': 'back',
  'chevron-right': 'forward',
  'menu-down': 'sort',
  'alert-circle': 'error',
  information: 'info',
};

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const scheme: ColorScheme = system === 'dark' ? 'dark' : 'light';
  const value = useMemo<AppTheme>(() => ({ scheme, colors: palettes[scheme] }), [scheme]);
  const paper = useMemo(() => paperTheme(scheme, value.colors), [scheme, value.colors]);
  const settings = useMemo(
    () => ({
      icon: ({ name, size, color }: { name: string; size: number; color?: string }) => (
        <ModontyIcon
          name={PAPER_ICON_MAP[name] ?? 'info'}
          size={size}
          color={color ?? value.colors.text}
          accent={value.colors.accent}
          knockout={value.colors.surface}
        />
      ),
    }),
    [value.colors],
  );
  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={paper} settings={settings}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): AppTheme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useAppTheme outside ThemeProvider');
  return theme;
}
