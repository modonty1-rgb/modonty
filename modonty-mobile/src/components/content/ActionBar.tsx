import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { compactNumber } from '@/lib/format';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

export type ActionItem = {
  key: string;
  icon: ModontyIconName;
  label: string;
  count?: number | null;
  active?: boolean;
  busy?: boolean;
  onPress: () => void;
};

/**
 * شريط أفعال المقال/الريل: كل فعل ٤٨dp، والحالة المفعّلة بتعبئة + نصّ لقارئ الشاشة (لا باللون وحده).
 * الفوتر ٦٤dp + insets.bottom (UIUX §٥).
 */
export const ActionBar = memo(function ActionBar({ items }: { items: ActionItem[] }) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {items.map((a) => (
        <Tap
          key={a.key}
          label={a.active ? `${a.label} (مفعّل)` : a.label}
          accessibilityState={{ selected: a.active, busy: a.busy }}
          disabled={a.busy}
          onPress={a.onPress}
          style={styles.item}
        >
          <View style={[styles.pill, a.active && { backgroundColor: colors.primaryContainer }]}>
            <Icon name={a.icon} size={control.iconSmall} tone={a.active ? 'onPrimaryContainer' : 'text'} />
            {a.count != null && a.count > 0 ? (
              <AppText variant="label" tone={a.active ? 'onPrimaryContainer' : 'text'} fixedSize>
                {compactNumber(a.count)}
              </AppText>
            ) : null}
          </View>
        </Tap>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.xs },
  item: { flex: 1, height: control.footer, alignItems: 'center', justifyContent: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    minHeight: control.touch - space.xs,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
  },
});
