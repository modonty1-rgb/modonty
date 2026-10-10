import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Tap } from '@/components/ui/Tap';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

/**
 * رأس الموقع على الجوال (TopNav.tsx) — ثابت في كل صفحة رئيسية: الشعار (← الرئيسية «/») · خانة «بحث متقدم»
 * · الإشعارات · حسابي. «حسابي» هنا لأنه ليس من تابات الشريط السبع.
 */
export const TopBar = memo(function TopBar() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { unreadNotifications, requireAuth } = useAuth();
  return (
    <View style={[styles.top, { paddingTop: insets.top, backgroundColor: colors.page, borderBottomColor: colors.border }]}>
      <View style={styles.row}>
        <Tap label="الرئيسية" minTarget={false} onPress={() => router.navigate('/')} style={styles.markTap}>
          <Image cachePolicy="memory-disk" source={require('../../../assets/brand/modonty-mark.png')} style={styles.mark} contentFit="contain" />
        </Tap>
        <Tap
          label="ابحث في المقالات والشركاء"
          onPress={() => router.navigate('/search')}
          style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Icon name="search" size={control.iconSmall} tone="muted" />
          <AppText variant="secondary" tone="muted" numberOfLines={1} style={styles.flex}>
            بحث متقدم
          </AppText>
        </Tap>
        <IconButton
          icon="notifications"
          label={unreadNotifications > 0 ? 'الإشعارات — غير مقروءة' : 'الإشعارات'}
          onPress={() => requireAuth(() => router.push('/account/notifications'))}
        />
        <IconButton icon="profile" label="حسابي" onPress={() => router.navigate('/account')} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  top: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: { height: control.header, flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingStart: space.screen, paddingEnd: space.xxs },
  markTap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 36, height: 36 },
  searchBox: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  flex: { flex: 1 },
});
