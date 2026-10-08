import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

export type TermModel = { key: string; slug: string; name: string; meta: string | null; description: string | null; logos: string[] };

/** صفّ تصنيف/وسم/مجال: الاسم · العدد · وصف قصير · شعارات أوّل الشركاء فيه. */
export const TermRow = memo(function TermRow({ item, icon, onOpen }: { item: TermModel; icon: ModontyIconName; onOpen: (slug: string) => void }) {
  const { colors } = useAppTheme();
  return (
    <Tap label={item.name} role="link" onPress={() => onOpen(item.slug)} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.icon, { backgroundColor: colors.surfaceRaised }]}>
        <Icon name={icon} />
      </View>
      <View style={styles.text}>
        <AppText variant="label" numberOfLines={1}>
          {item.name}
        </AppText>
        {item.description ? (
          <AppText variant="secondary" tone="muted" numberOfLines={2}>
            {item.description}
          </AppText>
        ) : null}
        {item.meta || item.logos.length > 0 ? (
          <View style={styles.metaRow}>
            {item.logos.slice(0, 4).map((l) => (
              <Image key={l} source={l} style={[styles.logo, { borderColor: colors.surface }]} contentFit="cover" />
            ))}
            {item.meta ? (
              <AppText variant="secondary" tone="muted">
                {item.meta}
              </AppText>
            ) : null}
          </View>
        ) : null}
      </View>
      <Icon name="forward" size={control.iconSmall} tone="muted" />
    </Tap>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.card },
  icon: { width: control.touch, height: control.touch, borderRadius: radius.field, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: space.xxs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.xxs },
  logo: { width: control.iconSmall, height: control.iconSmall, borderRadius: radius.pill, borderWidth: 1 },
});
