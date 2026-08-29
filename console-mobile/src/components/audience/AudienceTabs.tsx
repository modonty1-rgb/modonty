import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { control, fonts, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * The two-segment switch on S08. It selects what the list shows and nothing else — per the
 * navigation rule, a tab never performs an action.
 */

export type AudienceTabKey = 'questions' | 'comments';

export type AudienceTab = { key: AudienceTabKey; label: string; count: string };

export function AudienceTabs({ tabs, activeKey, onSelect }: { tabs: AudienceTab[]; activeKey: AudienceTabKey; onSelect: (key: AudienceTabKey) => void }) {
  const { theme } = useAppTheme();
  return <View style={[styles.bar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
    {tabs.map((tab) => {
      const active = tab.key === activeKey;
      return <Pressable
        key={tab.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`${tab.label} ${tab.count}`}
        onPress={() => onSelect(tab.key)}
        style={styles.tab}
      >
        <Text maxFontSizeMultiplier={1} style={[styles.label, { color: active ? theme.colors.textInteractive : theme.colors.muted }]}>{tab.label} {tab.count}</Text>
      </Pressable>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row-reverse', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, paddingHorizontal: spacing.xs },
  tab: { flex: 1, minHeight: control.minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' },
});
