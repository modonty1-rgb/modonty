import { router, useSegments } from 'expo-router';
import { memo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsType } from '@/theme/tokens';
import { IconButton } from './IconButton';

type Props = {
  title?: string;
  /** شاشة تفاصيل: رجوع خطوة واحدة (UIUX §٦). */
  back?: boolean;
  actions?: ReactNode;
  /** هيدر شفّاف فوق صورة/فيديو. */
  overlay?: boolean;
};

/**
 * رأس الشاشات المدفوعة = «الشريط المطوي» في Components 02: ٥٦dp + insets.top · surface.1 · خطّ سفلي ·
 * العنوان title-md 18/28 · الرجوع عند البداية (يمين) ويشير لليمين.
 */
export const Header = memo(function Header({ title, back, actions, overlay }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  // شاشة تُعرض تاباً في الشريط (المقالات · المجالات · الشركاء …) جذرٌ لا تفاصيل — فلا رجوع منها.
  const segments = useSegments();
  const showBack = back && segments[0] !== '(tabs)';
  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top, backgroundColor: overlay ? 'transparent' : colors.surface, borderBottomColor: colors.border },
        overlay && styles.overlay,
      ]}
    >
      <View style={styles.row}>
        {showBack ? (
          <IconButton
            icon="back"
            label="رجوع"
            tone={overlay ? 'onReels' : 'text'}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          />
        ) : null}
        <View style={styles.title}>
          {title ? (
            <Text
              style={[dsType.titleMd, { color: overlay ? colors.onReels : colors.text }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
              accessibilityRole="header"
            >
              {title}
            </Text>
          ) : null}
        </View>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bar: { borderBottomWidth: StyleSheet.hairlineWidth },
  overlay: { position: 'absolute', top: 0, start: 0, end: 0, zIndex: 2, borderBottomWidth: 0 },
  row: {
    height: ds.layout.appbarCollapsed,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ds.space.s1,
    gap: ds.space.s1,
  },
  title: { flex: 1, paddingHorizontal: ds.space.s3 },
  actions: { flexDirection: 'row', alignItems: 'center' },
});
