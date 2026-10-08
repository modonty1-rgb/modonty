import { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

/** خلفية الصفحة تصل الحافة؛ المحتوى يحترم insets عبر الهيدر والقائمة (UIUX §٥). */
export function Screen({ children }: PropsWithChildren) {
  const { colors } = useAppTheme();
  return <View style={[styles.root, { backgroundColor: colors.page }]}>{children}</View>;
}

const styles = StyleSheet.create({ root: { flex: 1 } });
