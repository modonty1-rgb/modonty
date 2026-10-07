import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { ApiError, CLIENT_MESSAGES } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon } from './Icon';

type Props = {
  icon: ModontyIconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'danger';
};

/** حالة فارغ/خطأ/بلا شبكة: نصّ + رمز + لون معاً، وفعل واحد (UIUX §٢ و§٨). */
export const StateView = memo(function StateView({ icon, title, body, actionLabel, onAction, tone = 'neutral' }: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View style={[styles.badge, { backgroundColor: tone === 'danger' ? colors.dangerContainer : colors.surfaceRaised }]}>
        <Icon name={icon} size={control.iconLarge} tone={tone === 'danger' ? 'onDangerContainer' : 'text'} />
      </View>
      <AppText variant="sectionTitle" align="center">
        {title}
      </AppText>
      {body ? (
        <AppText variant="body" tone="muted" align="center">
          {body}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} kind="outlined" compact />
        </View>
      ) : null}
    </View>
  );
});

/** خطأ يسمّي ما فشل ويقدّم إعادة المحاولة؛ وانقطاع الشبكة حالة مستقلّة. */
export function ErrorState({ error, onRetry, what }: { error: ApiError | null; onRetry: () => void; what: string }) {
  if (error?.isOffline) {
    return <StateView icon="refresh" title={CLIENT_MESSAGES.network} body={`تعذّر تحميل ${what}. تحقّق من الاتصال ثم أعد المحاولة.`} actionLabel="أعد المحاولة" onAction={onRetry} />;
  }
  if (error?.kind === 'config') {
    return <StateView icon="error" tone="danger" title="الإعداد ناقص" body={error.message} />;
  }
  return (
    <StateView
      icon="error"
      tone="danger"
      title={`تعذّر تحميل ${what}`}
      body={error?.message}
      actionLabel="أعد المحاولة"
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxl, gap: space.sm },
  badge: { width: control.stateBadge, height: control.stateBadge, borderRadius: radius.card, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  action: { marginTop: space.xs },
});
