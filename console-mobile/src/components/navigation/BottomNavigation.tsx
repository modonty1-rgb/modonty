import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ModontyIcon, ModontyIconName } from '@/src/components/brand/icons/ModontyIcon';
import { BottomTabRoute } from '@/src/routes/route-types';
import { fonts } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type TabItem = { route: BottomTabRoute; label: string; icon: ModontyIconName };
const tabs: TabItem[] = [
  { route: 'home', label: 'الرئيسية', icon: 'home' },
  { route: 'articles', label: 'المقالات', icon: 'articles' },
  { route: 'videos', label: 'الفيديوهات', icon: 'reels' },
  { route: 'audience', label: 'الجمهور', icon: 'comment' },
  { route: 'notifications', label: 'التنبيهات', icon: 'notifications' },
];

export function BottomNavigation({ activeRoute, unreadCount, bottomInset, onSelect }: { activeRoute: AppRouteOrHome; unreadCount: number; bottomInset: number; onSelect: (route: BottomTabRoute) => void }) {
  const { theme } = useAppTheme();
  return <View style={[styles.bar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, paddingBottom: Math.max(bottomInset, 8), minHeight: 68 + bottomInset }]}> 
    {tabs.map((tab) => {
      const active = activeRoute === tab.route;
      return <Pressable key={tab.route} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={tab.label} onPress={() => onSelect(tab.route)} style={styles.item}>
        <View>
          <ModontyIcon name={tab.icon} size={23} primary={active ? theme.colors.text : theme.colors.muted} accent={active ? theme.colors.primary : theme.colors.muted} />
          {tab.route === 'notifications' && unreadCount > 0 ? <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}><Text maxFontSizeMultiplier={1} style={styles.badgeText}>{unreadCount}</Text></View> : null}
        </View>
        <Text maxFontSizeMultiplier={1} style={[styles.label, { color: active ? theme.colors.primary : theme.colors.muted }]}>{tab.label}</Text>
      </Pressable>;
    })}
  </View>;
}

type AppRouteOrHome = BottomTabRoute | 'account';
const styles = StyleSheet.create({
  bar: { borderTopWidth: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8, paddingTop: 9 },
  item: { minWidth: 66, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { fontFamily: fonts.medium, fontSize: 11, writingDirection: 'rtl' },
  badge: { position: 'absolute', top: -8, right: -12, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#06131A', fontFamily: fonts.bold, fontSize: 10 },
});
