import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/theme/ThemeProvider';

/** شاشات حسابي خلف الدخول: بلا جلسة تُفتح شاشة الدخول بدل شاشة فارغة. */
export default function AccountLayout() {
  const { status } = useAuth();
  const { colors } = useAppTheme();
  if (status === 'signedOut') return <Redirect href="/auth/login" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.page } }} />;
}
