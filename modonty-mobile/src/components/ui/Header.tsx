import { router } from 'expo-router';
import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/ThemeProvider';
import { control, space } from '@/theme/tokens';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

type Props = {
  title?: string;
  /** شاشة تفاصيل: رجوع خطوة واحدة (UIUX §٦). */
  back?: boolean;
  actions?: ReactNode;
  /** هيدر شفّاف فوق صورة/فيديو. */
  overlay?: boolean;
};

/** الهيدر: ٥٦dp محتوى + insets.top (UIUX §٥). */
export const Header = memo(function Header({ title, back, actions, overlay }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top, backgroundColor: overlay ? 'transparent' : colors.page, borderBottomColor: colors.border },
        overlay && styles.overlay,
      ]}
    >
      <View style={styles.row}>
        {back ? (
          <IconButton
            icon="back"
            label="رجوع"
            tone={overlay ? 'onReels' : 'text'}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          />
        ) : null}
        <View style={styles.title}>
          {title ? (
            <AppText variant="pageTitle" numberOfLines={1} tone={overlay ? 'onReels' : 'text'} accessibilityRole="header">
              {title}
            </AppText>
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
    height: control.header,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xxs,
    gap: space.xxs,
  },
  title: { flex: 1, paddingHorizontal: space.sm },
  actions: { flexDirection: 'row', alignItems: 'center' },
});
