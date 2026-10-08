import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useFollow } from '@/hooks/useFollow';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

/**
 * شريط الموقع على الجوال (`MobileCtaBar` + `FollowCtaButton`): «تابع مدونتي» متابعة حقيقية بتعبئة
 * التركواز، وبجانبه إجراء ثانٍ بإطار — «صِر شريكاً» في صفحة مدونتي، «شاهد الطلّات» في المقالات.
 */
export const FollowCtaBar = memo(function FollowCtaBar({
  slug,
  secondary,
}: {
  slug: string;
  secondary: { label: string; icon: ModontyIconName; onPress: () => void };
}) {
  const { colors } = useAppTheme();
  const { following, busy, toggle } = useFollow(slug);
  const label = following === null ? 'جارٍ التحقّق…' : busy ? (following ? 'يُلغى…' : 'يُتابَع…') : following ? 'تتابع مدونتي' : 'تابع مدونتي';
  return (
    <View style={styles.row}>
      <Tap
        label={label}
        onPress={toggle}
        disabled={busy || following === null}
        style={[styles.cta, { backgroundColor: following ? colors.surface : colors.brandFill, borderColor: colors.brandFill }]}
      >
        <Icon name={following ? 'check' : 'notifications'} size={20} monochrome={!following} />
        <AppText variant="label" style={styles.bold}>
          {label}
        </AppText>
      </Tap>
      <Tap label={secondary.label} role="link" onPress={secondary.onPress} style={[styles.cta, { backgroundColor: colors.surface, borderColor: colors.brandFill }]}>
        <Icon name={secondary.icon} size={20} />
        <AppText variant="label" style={styles.bold}>
          {secondary.label}
        </AppText>
      </Tap>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.xs, alignSelf: 'stretch' },
  cta: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxs,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  bold: { fontWeight: '700' },
});
