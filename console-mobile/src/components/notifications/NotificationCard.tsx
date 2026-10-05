import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { rtlLine } from '@/src/components/ui/bidi';
import type { ModontyIconName } from '@/src/components/brand/icons/ModontyIcon';
import { GroupRow, IconShape } from '@/src/components/ui/Nabd';
import type { NotificationSummary } from '@/src/services/engagement-api';
import { fonts, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const iconByTarget: Record<NonNullable<NotificationSummary['target']>, ModontyIconName> = { article: 'articles', audience: 'question', videos: 'reels' };

type Props = { item: NotificationSummary; openPrefix: string; position: 'only' | 'first' | 'middle' | 'last'; onOpen: (item: NotificationSummary) => void };

/**
 * تنبيه واحد في S12 — «نبض»: صفّ في مجموعة مقطّعة، ورمز نوعه في دائرة.
 *
 * غير المقروء محمولٌ **ثلاث مرّات**: دائرة بأزرق البطل · نقطة بجانب العنوان · وكلمة «جديد» بلون
 * الرابط — فيبقى الفرق لمن لا يميّز الألوان وتحت شمس النهار. والصفّ الذي `target` له null لا
 * يُضغط: لا شاشة لنوعه بعد، وضغطة لا تقود لشيء أسوأ من لا ضغطة.
 */
export const NotificationCard = memo(function NotificationCard({ item, openPrefix, position, onOpen }: Props) {
  const { theme } = useAppTheme();
  const open = useCallback(() => onOpen(item), [item, onOpen]);
  return <GroupRow position={position} onPress={item.target === null ? undefined : open} accessibilityLabel={`${openPrefix} ${item.title} ${item.stateLabel}`}>
    <View style={styles.row}>
      <IconShape icon={item.target ? iconByTarget[item.target] : 'notifications'} tone={item.isUnread ? 'hero' : 'secondary'} />
      <View style={styles.copy}>
        <View style={styles.head}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{rtlLine(item.title)}</Text>
          {item.isUnread ? <View accessibilityElementsHidden importantForAccessibility="no" style={[styles.dot, { backgroundColor: theme.colors.brandFill }]} /> : null}
        </View>
        {item.body ? <Text numberOfLines={2} style={[styles.secondary, { color: theme.colors.text }]}>{rtlLine(item.body)}</Text> : null}
        <Text style={[styles.secondary, { color: theme.colors.muted }]}>
          <Text style={item.isUnread ? [styles.state, { color: theme.colors.textInteractive }] : null}>{item.stateLabel}</Text>
          {` · ${item.timeLabel}`}
        </Text>
      </View>
    </View>
  </GroupRow>;
});

const styles = StyleSheet.create({
  row: { alignItems: 'flex-start', flexDirection: 'row-reverse', gap: spacing.sm },
  copy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  head: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.xs, justifyContent: 'space-between' },
  title: { flex: 1, fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  dot: { borderRadius: 4, height: 8, width: 8 },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  state: { fontFamily: fonts.medium },
});
