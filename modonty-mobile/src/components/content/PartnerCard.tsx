import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import type { PartnerCardModel } from '@/lib/models';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

/** صفّ شريك: الشعار · الاسم + التوثيق · سطر التعريف · القطاع والمدينة · مؤشّر تنقّل. */
export const PartnerCard = memo(function PartnerCard({ item, onOpen }: { item: PartnerCardModel; onOpen: (slug: string) => void }) {
  const { colors } = useAppTheme();
  return (
    <Tap
      label={item.name}
      role="link"
      onPress={() => onOpen(item.slug)}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {item.logo ? (
        <Image cachePolicy="memory-disk" recyclingKey={item.key} source={item.logo} style={[styles.logo, { backgroundColor: colors.surfaceRaised }]} contentFit="contain" />
      ) : (
        <View style={[styles.logo, styles.logoFallback, { backgroundColor: colors.surfaceRaised }]}>
          <Icon name="company" tone="muted" />
        </View>
      )}
      <View style={styles.text}>
        <View style={styles.nameRow}>
          <AppText variant="label" numberOfLines={1} style={styles.flexShrink}>
            {item.name}
          </AppText>
          {item.verified ? <Icon name="trust" size={control.iconInline} tone="interactive" /> : null}
        </View>
        {item.line ? (
          <AppText variant="secondary" tone="muted" numberOfLines={2}>
            {item.line}
          </AppText>
        ) : null}
        {item.meta || item.rating ? (
          <View style={styles.nameRow}>
            {item.rating ? (
              <>
                <Icon name="rating" size={control.iconInline} tone="muted" />
                <AppText variant="secondary" tone="muted">
                  {item.rating}
                </AppText>
              </>
            ) : null}
            {item.meta ? (
              <AppText variant="secondary" tone="muted" numberOfLines={1} style={styles.flexShrink}>
                {item.rating ? `، ${item.meta}` : item.meta}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.card,
  },
  logo: { width: control.logo, height: control.logo, borderRadius: radius.image },
  logoFallback: { alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: space.xxs },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space.xxs },
  flexShrink: { flexShrink: 1 },
});
