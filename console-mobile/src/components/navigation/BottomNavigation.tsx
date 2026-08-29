import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon, ModontyIconName } from '@/src/components/brand/icons/ModontyIcon';
import { BottomTabRoute } from '@/src/routes/route-types';
import { control, fonts, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type TabItem = { route: BottomTabRoute; label: string; icon: ModontyIconName };
const tabs: TabItem[] = [
  { route: 'home', label: 'الرئيسية', icon: 'home' },
  { route: 'articles', label: 'المقالات', icon: 'articles' },
  { route: 'videos', label: 'الطلّات', icon: 'reels' },
  { route: 'audience', label: 'الجمهور', icon: 'comment' },
  { route: 'notifications', label: 'التنبيهات', icon: 'notifications' },
];

export function BottomNavigation({ activeRoute, unreadCount, bottomInset, onSelect }: { activeRoute: AppRouteOrHome; unreadCount: number; bottomInset: number; onSelect: (route: BottomTabRoute) => void }) {
  const { theme, mode } = useAppTheme();
  /**
   * `accent` الخام هو تركواز الماركة الفاتح: 10.00:1 على الشريط الداكن، لكن **1.66:1** على
   * الشريط الفاتح — أي أنّ تسمية التاب النشط، وهي العنصر الذي يقول للمستخدم «أنت هنا»،
   * كانت غير مقروءة على نصف مستخدمينا (WCAG 1.4.3 يفرض 4.5:1). `textInteractive` هو
   * نظير الماركة المضبوط لكل وضع: تركواز فاتح داكناً، وتركواز غامق فاتحاً (6.86:1).
   */
  const badgeTextColor = mode === 'dark' ? theme.colors.navy : theme.colors.textOnPrimary;
  return <View style={[styles.bar,{ backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, paddingBottom: Math.max(bottomInset, spacing.xs), minHeight: control.footerHeight + bottomInset }]}> 
    {tabs.map((tab) => {
      const active = activeRoute === tab.route;
      return <Pressable key={tab.route} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={tab.label} onPress={() => onSelect(tab.route)} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
        <View>
          <ModontyIcon name={tab.icon} size={control.iconSize} primary={active ? theme.colors.text : theme.colors.muted} accent={active ? theme.colors.accent : theme.colors.muted} />
          {tab.route === 'notifications' && unreadCount > 0 ? <View style={[styles.badge, { backgroundColor: theme.colors.textInteractive }]}><Text maxFontSizeMultiplier={1} style={[styles.badgeText, { color: badgeTextColor }]}>{unreadCount}</Text></View> : null}
        </View>
        <Text maxFontSizeMultiplier={1} style={[styles.label, { color: active ? theme.colors.textInteractive : theme.colors.muted }]}>{tab.label}</Text>
      </Pressable>;
    })}
  </View>;
}

type AppRouteOrHome = BottomTabRoute | 'account';
const styles = StyleSheet.create({
  pressed: { opacity: 0.72 },
  bar: { borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: spacing.xs, paddingTop: spacing.xs },
  item: { flex: 1, minHeight: control.minTouchTarget, alignItems: 'center', justifyContent: 'center', gap: spacing.xxs },
  label: { fontFamily: fonts.medium, fontSize: typography.tabLabel, lineHeight: typography.lineHeightTabLabel, writingDirection: 'rtl' },
  badge: { position: 'absolute', top: -spacing.xs, right: -spacing.sm, minWidth: spacing.xl, height: spacing.xl, borderRadius: radii.field, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: fonts.bold, fontSize: typography.tabLabel, lineHeight: typography.lineHeightTabLabel },
});
