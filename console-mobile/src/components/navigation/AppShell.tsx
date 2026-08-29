import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { ReactNode, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyWordmark } from '@/src/components/brand/ModontyWordmark';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { BottomTabRoute, PushedRoute } from '@/src/routes/route-types';
import { brand, control, fonts, radii, spacing, typography } from '@/src/theme/tokens';
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
  const [isMenuOpen, setMenuOpen] = useState(false);

  return <View style={[styles.page, { backgroundColor: theme.colors.page }]}>
    <View style={[styles.header, { height: control.headerHeight + insets.top, paddingTop: insets.top }]}>
      <Pressable onPress={() => setMenuOpen(true)} accessibilityRole="button" accessibilityLabel={copy.menuLabel} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
        <ModontyIcon name="menu" size={control.headerIconSize} primary={theme.colors.text} accent={theme.colors.accent} />
      </Pressable>
      <View accessibilityLabel={copy.brandLabel} style={styles.homeButton}>
        <ModontyWordmark width={brand.wordmarkWidth} height={brand.wordmarkHeight} />
      </View>
      <Pressable onPress={() => onOpenPushed('account')} accessibilityRole="button" accessibilityLabel={copy.accountLabel} style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}>
        {client?.logoUrl ? <Image source={{ uri: client.logoUrl }} accessibilityLabel={client.logoAlt ?? client.name} cachePolicy="memory-disk" contentFit="contain" style={styles.avatarImage} /> : null}
      </Pressable>
    </View>

    <View style={styles.content}>{children}</View>
    <BottomNavigation activeRoute={activeRoute} unreadCount={unreadCount} bottomInset={insets.bottom} onSelect={onSelectTab} />

    <Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
      <Pressable accessibilityRole="button" accessibilityLabel={copy.closeMenuLabel} style={styles.backdrop} onPress={() => setMenuOpen(false)}>
        <Pressable accessible={false} style={[styles.menu, { backgroundColor: theme.colors.surface, paddingTop: insets.top + spacing.lg }]} onPress={() => undefined}>
          <View style={styles.menuTop}>
            <Text maxFontSizeMultiplier={1} style={[styles.menuTitle, { color: theme.colors.text }]}>{copy.menuLabel}</Text>
            <Pressable onPress={() => setMenuOpen(false)} accessibilityRole="button" accessibilityLabel={copy.closeMenuLabel} hitSlop={spacing.xs} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <ModontyIcon name="close" size={control.iconSize} primary={theme.colors.text} accent={theme.colors.accent} />
            </Pressable>
          </View>

          <Pressable accessibilityRole="button" accessibilityLabel={copy.accountLabel} style={({ pressed }) => [styles.menuItem, { borderTopColor: theme.colors.border, borderBottomColor: theme.colors.border }, pressed && styles.pressed]} onPress={() => { setMenuOpen(false); onOpenPushed('account'); }}>
            <Text maxFontSizeMultiplier={1} style={[styles.menuText, { color: theme.colors.text }]}>{copy.accountLabel}</Text>
            <ModontyIcon name="profile" size={control.iconSize} primary={theme.colors.muted} accent={theme.colors.accent} />
          </Pressable>

          {/* مفتاح المظهر يعلن حالته لقارئ الشاشة، لا زرّاً يغيّر تسميته فقط. */}
          <Pressable accessibilityRole="switch" accessibilityState={{ checked: mode === 'dark' }} accessibilityLabel={mode === 'dark' ? copy.lightModeLabel : copy.darkModeLabel} style={({ pressed }) => [styles.menuItem, { borderBottomColor: theme.colors.border }, pressed && styles.pressed]} onPress={toggleMode}>
            <Text maxFontSizeMultiplier={1} style={[styles.menuText, { color: theme.colors.text }]}>{mode === 'dark' ? copy.lightModeLabel : copy.darkModeLabel}</Text>
            <ModontyIcon name="views" size={control.iconSize} primary={theme.colors.muted} accent={theme.colors.accent} />
          </Pressable>

          <Pressable accessibilityRole="button" accessibilityLabel={copy.supportLabel} style={({ pressed }) => [styles.menuItem, { borderBottomColor: theme.colors.border }, pressed && styles.pressed]} onPress={() => { setMenuOpen(false); onOpenPushed('support'); }}>
            <Text maxFontSizeMultiplier={1} style={[styles.menuText, { color: theme.colors.text }]}>{copy.supportLabel}</Text>
            <ModontyIcon name="question" size={control.iconSize} primary={theme.colors.muted} accent={theme.colors.accent} />
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  pressed: { opacity: 0.72 },
  header: { paddingHorizontal: spacing.screenHorizontal, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: control.minTouchTarget, height: control.minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  homeButton: { width: brand.wordmarkWidth, height: control.minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: control.minTouchTarget, height: control.minTouchTarget, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: control.clientAvatarVisualSize, height: control.clientAvatarVisualSize, borderRadius: control.clientAvatarVisualSize, resizeMode: 'contain' },
  content: { flex: 1, minHeight: 0 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.56)', alignItems: 'flex-end', justifyContent: 'flex-start' },
  // العرض من سلّم المسافات لا رقماً مخترَعاً: ٣٢×٩ = ٢٨٨، وهو أقرب مقاس درج على شاشة ٣٦٠–٤١١dp.
  menu: { width: spacing.xxl * 9, minHeight: '100%', borderBottomLeftRadius: radii.card, borderTopLeftRadius: radii.card, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  menuTop: { minHeight: control.minTouchTarget, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  menuTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  closeButton: { width: control.minTouchTarget, height: control.minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  menuItem: { minHeight: control.buttonHeight, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  menuText: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
});
