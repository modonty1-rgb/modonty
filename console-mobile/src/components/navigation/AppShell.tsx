import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ReactNode, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModontyWordmark } from '@/src/components/brand/ModontyWordmark';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { fixtureUnreadInboxCount } from '@/src/data/client-fixtures';
import { AppRoute, BottomTabRoute, ShellRoute } from '@/src/routes/route-types';
import { fonts } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { BottomNavigation } from './BottomNavigation';
import type { MobileClientProfile } from '@/src/services/mobile-api';

export function AppShell({ client, activeRoute, onNavigate, children }: { client: MobileClientProfile | null; activeRoute: ShellRoute; onNavigate: (route: Exclude<AppRoute, 'login'>) => void; children: ReactNode }) {
  const { theme, mode, toggleMode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const onTabSelect = (route: BottomTabRoute) => onNavigate(route);
  return <View style={[styles.page, { backgroundColor: theme.colors.page }]}>
    <View style={[styles.header, { height: 60 + insets.top, paddingTop: insets.top }]}>
      <Pressable onPress={() => setMenuOpen(true)} accessibilityRole="button" accessibilityLabel="القائمة" style={styles.headerButton}>
        <ModontyIcon name="menu" size={24} primary={theme.colors.text} accent={theme.colors.primary} />
      </Pressable>
      <View accessibilityLabel="شعار مودونتي" style={styles.homeButton}>
        <ModontyWordmark width={124} height={43} />
      </View>
      <Pressable onPress={() => onNavigate('account')} accessibilityRole="button" accessibilityLabel="حسابي" style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
        {client?.logoUrl ? <Image source={{ uri: client.logoUrl }} accessibilityLabel={client.logoAlt ?? `شعار ${client.name}`} cachePolicy="memory-disk" contentFit="contain" style={styles.avatarImage} /> : <Text style={styles.avatarText}>{client?.name.slice(0, 2) ?? 'م'}</Text>}
      </Pressable>
    </View>
    <View style={styles.content}>{children}</View>
    <BottomNavigation activeRoute={activeRoute} unreadCount={fixtureUnreadInboxCount} bottomInset={insets.bottom} onSelect={onTabSelect} />
    <Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
      <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
        <Pressable style={[styles.menu, { backgroundColor: theme.colors.surface, paddingTop: insets.top + 18 }]} onPress={() => undefined}>
          <View style={styles.menuTop}><Text maxFontSizeMultiplier={1} style={[styles.menuTitle, { color: theme.colors.text }]}>القائمة</Text><Pressable onPress={() => setMenuOpen(false)} accessibilityRole="button" accessibilityLabel="إغلاق القائمة" hitSlop={8} style={styles.closeButton}><ModontyIcon name="close" size={19} primary={theme.colors.text} accent={theme.colors.primary}/></Pressable></View>
          <Pressable style={[styles.menuItem, { borderTopColor: theme.colors.border, borderBottomColor: theme.colors.border }]} onPress={() => { setMenuOpen(false); onNavigate('account'); }}><Text maxFontSizeMultiplier={1} style={[styles.menuText, { color: theme.colors.text }]}>حسابي</Text><ModontyIcon name="profile" size={20} primary={theme.colors.muted} accent={theme.colors.primary} /></Pressable>
          <Pressable style={[styles.menuItem, { borderBottomColor: theme.colors.border }]} onPress={toggleMode}><Text maxFontSizeMultiplier={1} style={[styles.menuText, { color: theme.colors.text }]}>{mode === 'dark' ? 'المظهر الفاتح' : 'المظهر الداكن'}</Text><ModontyIcon name="views" size={20} primary={theme.colors.muted} accent={theme.colors.primary} /></Pressable>
          <Pressable style={[styles.menuItem, { borderBottomColor: theme.colors.border }]} onPress={() => { setMenuOpen(false); onNavigate('support'); }}><Text maxFontSizeMultiplier={1} style={[styles.menuText, { color: theme.colors.text }]}>المساعدة والدعم</Text><ModontyIcon name="question" size={20} primary={theme.colors.muted} accent={theme.colors.primary} /></Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  header: { paddingHorizontal: 20, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  homeButton: { width: 144, height: 48, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 35, height: 35, borderRadius: 18, resizeMode: 'contain' },
  avatarText: { color: '#06131A', fontFamily: fonts.bold, fontSize: 13 },
  content: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.56)', alignItems: 'flex-end', justifyContent: 'flex-start' },
  menu: { width: 304, minHeight: '100%', borderBottomLeftRadius: 28, borderTopLeftRadius: 28, paddingHorizontal: 20, paddingBottom: 20 },
  menuTop: { minHeight: 48, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  menuTitle: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, textAlign: 'right', writingDirection: 'rtl' },
  closeButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  menuItem: { minHeight: 56, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  menuText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, writingDirection: 'rtl' },
});
