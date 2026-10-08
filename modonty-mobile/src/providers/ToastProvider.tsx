import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

type Tone = 'info' | 'error' | 'success';
type Toast = { show: (message: string, tone?: Tone) => void };
const ToastContext = createContext<Toast | null>(null);

/** رسائل الفعل القصيرة (نجح/فشل) — نصّ صريح دائماً، فلا تُنقل الحالة باللون وحده. */
export function ToastProvider({ children }: PropsWithChildren) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<{ message: string; tone: Tone } | null>(null);
  const show = useCallback((message: string, tone: Tone = 'info') => setState({ message, tone }), []);
  const value = useMemo(() => ({ show }), [show]);
  const bg = state?.tone === 'error' ? colors.dangerContainer : state?.tone === 'success' ? colors.positiveContainer : colors.surfaceHigh;
  const tone = state?.tone === 'error' ? 'onDangerContainer' : state?.tone === 'success' ? 'onPositiveContainer' : 'text';
  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        visible={state !== null}
        onDismiss={() => setState(null)}
        duration={4000}
        style={[styles.bar, { backgroundColor: bg, marginBottom: insets.bottom + control.footer + space.xs }]}
        action={{ label: 'إغلاق', onPress: () => setState(null), textColor: colors.interactive }}
      >
        <AppText variant="label" tone={tone}>
          {state?.message ?? ''}
        </AppText>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): Toast {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast outside ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({ bar: { borderRadius: radius.button } });
