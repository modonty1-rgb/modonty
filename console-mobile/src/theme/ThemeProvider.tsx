import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { readThemeMode, saveThemeMode } from '@/src/services/mobile-session';
import { ThemeMode, themes } from './tokens';

type AppThemeContextValue = {
  theme: (typeof themes)[ThemeMode];
  mode: ThemeMode;
  /**
   * اختيار العميل المحفوظ قُرئ. قبله لا يُرسم شيء ولا تُخفى شاشة البداية.
   *
   * `app.json` يثبّت `userInterfaceStyle: "dark"`، فـ`useColorScheme()` يرجع «داكن» دائماً،
   * والوضع المحفوظ يُقرأ من التخزين **بعد** أوّل رسمة. فكان عميل الوضع الفاتح يرى شاشة داكنة
   * تومض ثم تنقلب فاتحة مع كل تشغيل (قِيس على جوّال خالد). الآن الرسمة الأولى بالوضع الصحيح.
   */
  isReady: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const deviceMode = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(deviceMode === 'light' ? 'light' : 'dark');
  const [isReady, setReady] = useState(false);

  /** اختيار العميل يُحفظ ويُسترجع عند الفتح — كان يرجع لمظهر الجهاز مع كل تشغيل. */
  useEffect(() => {
    void readThemeMode()
      .then((stored) => { if (stored === 'light' || stored === 'dark') setModeState(stored); })
      .catch((reason: unknown) => console.warn('[theme] read failed', reason))
      .finally(() => setReady(true));
  }, []);

  /**
   * خلفية النافذة الأصلية تتبع الوضع: هي ما يظهر لحظة الانتقال بين الشاشات وتحت شريطَي
   * النظام في edge-to-edge، وكانت داكنة ثابتة من `app.json` فتلمع خلف الوضع الفاتح.
   */
  useEffect(() => {
    if (!isReady) return;
    void SystemUI.setBackgroundColorAsync(themes[mode].colors.page).catch((reason: unknown) => console.warn('[theme] window background failed', reason));
  }, [isReady, mode]);
  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void saveThemeMode(next).catch((reason: unknown) => console.warn('[theme] save failed', reason));
  }, []);

  const value = useMemo(() => ({
    mode,
    isReady,
    theme: themes[mode],
    setMode,
    toggleMode: () => setMode(mode === 'dark' ? 'light' : 'dark'),
  }), [isReady, mode, setMode]);
  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) throw new Error('useAppTheme must be used inside AppThemeProvider');
  return context;
}
