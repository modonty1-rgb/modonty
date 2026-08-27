import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode, themes } from './tokens';

type AppThemeContextValue = {
  theme: (typeof themes)[ThemeMode];
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const deviceMode = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(deviceMode === 'light' ? 'light' : 'dark');
  const value = useMemo(() => ({
    mode,
    theme: themes[mode],
    setMode,
    toggleMode: () => setMode((current) => current === 'dark' ? 'light' : 'dark'),
  }), [mode]);
  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) throw new Error('useAppTheme must be used inside AppThemeProvider');
  return context;
}
