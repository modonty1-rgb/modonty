import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale } from '@/theme/tokens';

export type Row = { key: string; icon: ModontyIconName; label: string; hint?: string | null; onPress: () => void; chevron?: boolean };

/**
 * مجموعة صفوف — Screens B · 11: بطاقة بيضاء زاوية ٢٠ بحدّ، صفوف ≥٥٦ (أيقونة ٢٠ · العنوان ١٥ w700 · سهم)
 * بفواصل شعرية. `danger` = بطاقة منفصلة بحدّ ونصّ أحمر (حذف الحساب).
 */
export function RowGroup({ rows, danger }: { rows: Row[]; danger?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: danger ? colors.dangerContainer : colors.border }]}>
      {rows.map((r, i) => (
        <Fragment key={r.key}>
          {i > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
          <Tap label={r.hint ? `${r.label}، ${r.hint}` : r.label} role={r.chevron === false ? 'button' : 'link'} onPress={r.onPress} style={styles.row}>
            <Icon name={r.icon} size={20} tone={danger ? 'danger' : 'text'} monochrome />
            <Text style={[styles.label, { color: danger ? colors.danger : colors.text }]} maxFontSizeMultiplier={dsFontScale.max}>
              {r.label}
            </Text>
            {r.hint ? (
              <Text style={[styles.hint, { color: colors.muted }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                {r.hint}
              </Text>
            ) : null}
            {r.chevron === false || danger ? null : <Icon name="chevron" size={18} tone="muted" monochrome />}
          </Tap>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: ds.layout.gutter, borderRadius: ds.radius.lg, borderWidth: 1, overflow: 'hidden' },
  row: { minHeight: 56, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { height: StyleSheet.hairlineWidth },
  label: { flex: 1, fontFamily: 'Tajawal_700Bold', fontSize: 15, lineHeight: 22 },
  hint: { maxWidth: '40%', fontFamily: 'Tajawal_500Medium', fontSize: 13, lineHeight: 20 },
});
