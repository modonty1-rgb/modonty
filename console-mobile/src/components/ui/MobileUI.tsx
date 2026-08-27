import { Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ReactNode } from 'react';
import { ModontyIcon, ModontyIconName } from '@/src/components/brand/icons/ModontyIcon';
import { fonts } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export function Screen({ title, icon, children }: { title: string; icon: ModontyIconName; children: ReactNode }) {
  const { theme } = useAppTheme();
  return <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
    <View style={styles.screenTitle}><ModontyIcon name={icon} size={22} primary={theme.colors.text} accent={theme.colors.primary}/><Text style={[styles.pageTitle, { color: theme.colors.text }]}>{title}</Text></View>
    {children}
  </ScrollView>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { theme } = useAppTheme();
  return <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}>{children}</View>;
}

export function SectionTitle({ children, actionLabel, onAction }: { children: string; actionLabel?: string; onAction?: () => void }) {
  const { theme } = useAppTheme();
  return <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{children}</Text>{actionLabel && onAction ? <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button" accessibilityLabel={actionLabel}><Text style={[styles.sectionAction, { color: theme.colors.primary }]}>{actionLabel}</Text></Pressable> : null}</View>;
}

export function StatusPill({ children, tone = 'primary' }: { children: string; tone?: 'primary' | 'warning' | 'danger' | 'muted' }) {
  const { theme } = useAppTheme();
  const color = tone === 'warning' ? theme.colors.warning : tone === 'danger' ? theme.colors.danger : tone === 'muted' ? theme.colors.muted : theme.colors.primary;
  return <View style={[styles.pill, { borderColor: color }]}><Text style={[styles.pillText, { color }]}>{children}</Text></View>;
}

export function PrimaryAction({ label, icon, onPress, style, tone = 'primary' }: { label: string; icon?: ModontyIconName; onPress: () => void; style?: StyleProp<ViewStyle>; tone?: 'primary' | 'secondary' }) {
  const { theme } = useAppTheme();
  const foreground = tone === 'primary' ? '#06131A' : theme.colors.text;
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.primaryAction, { backgroundColor: tone === 'primary' ? theme.colors.primary : theme.colors.surfaceRaised, borderColor: tone === 'primary' ? theme.colors.primary : theme.colors.border, borderWidth: tone === 'primary' ? 0 : 1 }, style]}>{icon ? <ModontyIcon name={icon} size={19} primary={foreground} accent={tone === 'primary' ? '#0E065A' : theme.colors.primary}/> : null}<Text style={[styles.primaryText, { color: foreground }]}>{label}</Text></Pressable>;
}

export function EmptyState({ icon, title, copy, actionLabel, onAction }: { icon: ModontyIconName; title: string; copy: string; actionLabel?: string; onAction?: () => void }) {
  const { theme } = useAppTheme();
  return <Card style={styles.empty}><ModontyIcon name={icon} size={38} primary={theme.colors.text} accent={theme.colors.primary}/><Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{title}</Text><Text style={[styles.emptyCopy, { color: theme.colors.muted }]}>{copy}</Text>{actionLabel && onAction ? <PrimaryAction label={actionLabel} icon={icon} onPress={onAction} style={styles.emptyAction}/> : null}</Card>;
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 18, paddingBottom: 28 },
  screenTitle: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 18, marginBottom: 22 },
  pageTitle: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 26, writingDirection: 'rtl' },
  card: { borderWidth: 1, borderRadius: 20, padding: 16 },
  sectionHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 10 },
  sectionTitle: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, writingDirection: 'rtl' },
  sectionAction: { fontFamily: fonts.medium, fontSize: 13, writingDirection: 'rtl' },
  pill: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, writingDirection: 'rtl' },
  primaryAction: { minHeight: 48, borderRadius: 16, paddingHorizontal: 18, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, writingDirection: 'rtl' },
  empty: { minHeight: 240, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26 },
  emptyTitle: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, writingDirection: 'rtl', marginTop: 15, textAlign: 'center' },
  emptyCopy: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, writingDirection: 'rtl', marginTop: 6, textAlign: 'center' },
  emptyAction: { alignSelf: 'stretch', marginTop: 18 },
});
