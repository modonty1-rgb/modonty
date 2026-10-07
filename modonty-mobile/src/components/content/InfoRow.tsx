import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

/** صفّ عامّ: رمز · عنوان · سطر ثانٍ · سطر ثالث · مؤشّر تنقّل إن كان يفتح شيئاً. */
export const InfoRow = memo(function InfoRow({
  icon,
  title,
  body,
  meta,
  badge,
  onPress,
}: {
  icon: ModontyIconName;
  title: string;
  body?: string | null;
  meta?: string | null;
  badge?: string | null;
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();
  const content = (
    <>
      <Icon name={icon} tone="muted" />
      <View style={styles.text}>
        <AppText variant="label" numberOfLines={2}>
          {title}
        </AppText>
        {body ? (
          <AppText variant="body" tone="muted" numberOfLines={4}>
            {body}
          </AppText>
        ) : null}
        {meta || badge ? (
          <View style={styles.metaRow}>
            {badge ? (
              <View style={[styles.badge, { backgroundColor: colors.surfaceRaised }]}>
                <AppText variant="secondary">{badge}</AppText>
              </View>
            ) : null}
            {meta ? (
              <AppText variant="secondary" tone="muted">
                {meta}
              </AppText>
            ) : null}
          </View>
        ) : null}
      </View>
      {onPress ? <Icon name="forward" size={control.iconSmall} tone="muted" /> : null}
    </>
  );
  const style = [styles.row, { backgroundColor: colors.surface, borderColor: colors.border }];
  return onPress ? (
    <Tap label={title} role="link" onPress={onPress} style={style}>
      {content}
    </Tap>
  ) : (
    <View style={style} accessible>
      {content}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.card },
  text: { flex: 1, gap: space.xxs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, flexWrap: 'wrap' },
  badge: { borderRadius: radius.pill, paddingHorizontal: space.xs, paddingVertical: space.xxs },
});
