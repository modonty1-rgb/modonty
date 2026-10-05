import { Image } from 'expo-image';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyWordmark } from '@/src/components/brand/ModontyWordmark';
import { ModontyIcon, ModontyIconName } from '@/src/components/brand/icons/ModontyIcon';
import { BackgroundGlow, haptic, useReduceMotion } from '@/src/components/ui/Nabd';
import { BottomTabRoute, PushedRoute } from '@/src/routes/route-types';
import { brand, control, fonts, motion, nabd, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { BottomNavigation } from './BottomNavigation';
import type { MobileClientProfile, MobileShellCopy } from '@/src/services/mobile-api';

export function AppShell({ client, copy, activeRoute, unreadCount, onSelectTab, onOpenPushed, children }: {
  client: MobileClientProfile | null;
  /** نصوص الغلاف من `/dashboard` — لا نصّ مكتوب هنا. */
  copy: MobileShellCopy;
  activeRoute: BottomTabRoute;
  unreadCount: number;
  onSelectTab: (tab: BottomTabRoute) => void;
  onOpenPushed: (route: PushedRoute) => void;
  children: ReactNode;
}) {
  const { theme, mode, toggleMode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  const [isMenuMounted, setMenuMounted] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuProgress = useRef(new Animated.Value(0)).current;

  /**
   * القائمة تنزل ٨ نقاط وتظهر في ٢٠٠ms، وتُغلق في ١٥٠ms ثم تُزال — جدول حركة «نبض».
   * `Modal` بلا حركة النظام: النظام يُخفي الخلفية والقائمة معاً بنفس التلاشي.
   */
  useEffect(() => {
    if (isMenuOpen) {
      setMenuMounted(true);
      Animated.timing(menuProgress, { toValue: 1, duration: reduced ? 0 : motion.menuOpen, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
      return;
    }
    Animated.timing(menuProgress, { toValue: 0, duration: reduced ? 0 : motion.menuClose, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(({ finished }) => { if (finished) setMenuMounted(false); });
  }, [isMenuOpen, menuProgress, reduced]);

  const closeMenu = () => setMenuOpen(false);
  const openFromMenu = (route: PushedRoute) => { setMenuOpen(false); setMenuMounted(false); onOpenPushed(route); };
  const menuTranslate = menuProgress.interpolate({ inputRange: [0, 1], outputRange: [-motion.menuOffset, 0] });

  const menuRow = (key: string, icon: ModontyIconName, label: string, onPress: () => void, extra?: { role: 'switch'; checked: boolean }, highlighted = false) => <Pressable
    key={key}
    accessibilityRole={extra?.role ?? 'button'}
    accessibilityState={extra ? { checked: extra.checked } : undefined}
    accessibilityLabel={label}
    onPress={() => { haptic('light'); onPress(); }}
    style={({ pressed }) => [styles.menuItem, highlighted && { backgroundColor: theme.colors.surfaceHigh }, pressed && styles.pressed]}
  >
    <ModontyIcon name={icon} size={control.iconSize} primary={theme.colors.text} accent={theme.colors.accent} />
    <Text maxFontSizeMultiplier={1.3} style={[styles.menuText, { color: theme.colors.text }]}>{label}</Text>
  </Pressable>;

  /**
   * الهيدر بلا قائمة ☰ — قرار خالد (٤ أكتوبر): بنودها الثلاثة (حسابي · المظهر · الدعم) كلها
   * تخصّ الحساب، فمكانها تحت صورة العميل. والجانب الآخر فراغٌ بعرض الزرّ كي يبقى الشعار وسطاً.
   * الشريط السفلي يطفو فوق المحتوى (`absolute`)، فالمحتوى يمتدّ إلى حافّة الشاشة ويحجز هامشه بنفسه.
   */
  return <View style={[styles.page, { backgroundColor: theme.colors.page }]}>
    <BackgroundGlow />
    <View style={[styles.header, { height: control.headerHeight + insets.top, paddingTop: insets.top }]}>
      <View style={styles.headerButton} />
      <View accessibilityLabel={copy.brandLabel} style={styles.homeButton}>
        <ModontyWordmark width={brand.wordmarkWidth} height={brand.wordmarkHeight} />
      </View>
      <Pressable onPress={() => { haptic('light'); setMenuOpen(true); }} accessibilityRole="button" accessibilityState={{ expanded: isMenuOpen }} accessibilityLabel={copy.accountLabel} style={({ pressed }) => [styles.avatar, isMenuOpen && { backgroundColor: theme.colors.secondary }, pressed && styles.pressed]}>
        {client?.logoUrl ? <Image source={{ uri: client.logoUrl }} accessibilityLabel={client.logoAlt ?? client.name} cachePolicy="memory-disk" contentFit="contain" style={styles.avatarImage} /> : null}
      </Pressable>
    </View>

    <View style={styles.content}>{children}</View>
    <BottomNavigation activeRoute={activeRoute} unreadCount={unreadCount} bottomInset={insets.bottom} onSelect={onSelectTab} />

    {/* `statusBarTranslucent` يجعل إحداثيات النافذة هي إحداثيات الشاشة، فتقع القائمة تحت الصورة تماماً. */}
    <Modal visible={isMenuMounted} transparent statusBarTranslucent animationType="none" onRequestClose={closeMenu}>
      <Pressable accessibilityRole="button" accessibilityLabel={copy.closeMenuLabel} style={styles.fill} onPress={closeMenu}>
        <Animated.View pointerEvents="none" style={[styles.fill, { backgroundColor: theme.colors.scrim, opacity: menuProgress }]} />
      </Pressable>
      <Animated.View style={[styles.dropdown, { top: insets.top + control.headerHeight - spacing.xs, backgroundColor: theme.colors.menuSurface, boxShadow: `inset 0 1px 0 ${theme.colors.edgeHighlight}, ${theme.colors.liftShadow}`, opacity: menuProgress, transform: [{ translateY: menuTranslate }] }]}>
        {menuRow('account', 'profile', copy.accountLabel, () => openFromMenu('account'), undefined, true)}
        {/* مفتاح المظهر يعلن حالته لقارئ الشاشة، ولا يغلق القائمة: العميل يرى أثره فوراً. */}
        {copy.themeLabel && copy.lightShortLabel && copy.darkShortLabel
          ? <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: mode === 'dark' }}
            accessibilityLabel={mode === 'dark' ? copy.darkModeLabel : copy.lightModeLabel}
            onPress={() => { haptic('selection'); toggleMode(); }}
            style={({ pressed }) => [styles.menuItem, styles.themeItem, pressed && styles.pressed]}
          >
            <ModontyIcon name="moon" size={control.iconSize} primary={theme.colors.text} accent={theme.colors.accent} />
            <Text maxFontSizeMultiplier={1.3} numberOfLines={1} style={[styles.menuText, { color: theme.colors.text }]}>{copy.themeLabel}</Text>
            {/* المبدّل يُظهر الوضع الحالي بكبسولة البطل — «فاتح | داكن» كما في الموكب. */}
            <View style={[styles.themeSegment, { backgroundColor: theme.colors.surfaceHigh }]}>
              {([['light', copy.lightShortLabel], ['dark', copy.darkShortLabel]] as const).map(([key, label]) => <View key={key} style={[styles.themeOption, mode === key && { backgroundColor: theme.colors.hero }]}>
                <Text maxFontSizeMultiplier={1} style={[styles.themeOptionText, { color: mode === key ? theme.colors.onHero : theme.colors.muted }]}>{label}</Text>
              </View>)}
            </View>
          </Pressable>
          : menuRow('theme', 'moon', mode === 'dark' ? copy.lightModeLabel : copy.darkModeLabel, toggleMode, { role: 'switch', checked: mode === 'dark' })}
        {menuRow('support', 'support', copy.supportLabel, () => openFromMenu('support'))}
      </Animated.View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  fill: { ...StyleSheet.absoluteFillObject },
  pressed: { opacity: 0.72 },
  header: { paddingHorizontal: spacing.screenHorizontal, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: control.minTouchTarget, height: control.minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  homeButton: { width: brand.wordmarkWidth, height: control.minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: control.minTouchTarget, height: control.minTouchTarget, borderRadius: nabd.pill, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: control.clientAvatarVisualSize, height: control.clientAvatarVisualSize, borderRadius: control.clientAvatarVisualSize, resizeMode: 'contain' },
  content: { flex: 1, minHeight: 0 },
  // تحت الصورة على نفس حافّتها (الهيدر `row-reverse`، فالصورة في الطرف الأيسر).
  dropdown: { position: 'absolute', left: spacing.screenHorizontal, width: nabd.menuWidth, borderRadius: nabd.menuRadius, padding: spacing.xs },
  menuItem: { minHeight: control.buttonHeight, flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: nabd.menuItemRadius },
  // `row-reverse`: «فاتح» أوّلاً من اليمين كما يُقرأ.
  themeSegment: { borderRadius: nabd.pill, flexDirection: 'row-reverse', padding: spacing.xxs },
  themeItem: { gap: spacing.xs },
  themeOption: { borderRadius: nabd.pill, paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs },
  themeOptionText: { fontFamily: fonts.medium, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, writingDirection: 'rtl' },
  menuText: { flex: 1, fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
});
