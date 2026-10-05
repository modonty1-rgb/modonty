import { memo, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { rtlLine } from '@/src/components/ui/bidi';
import { AudienceAvatar } from '@/src/components/audience/AudienceAvatar';
import { PillButton, StatusBadge, TonalCard } from '@/src/components/ui/Nabd';
import type { AudienceCommentSummary } from '@/src/services/engagement-api';
import { fonts, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export type CommentDecision = 'approve' | 'reject';

type Props = {
  item: AudienceCommentSummary;
  approveLabel?: string;
  rejectLabel?: string;
  badgeLabel?: string;
  /** يرجع رسالة خطأ عربية لو فشل القرار، أو `null` لو نجح (والبطاقة تختفي من القائمة). */
  onDecide?: (item: AudienceCommentSummary, decision: CommentDecision) => Promise<string | null>;
};

/**
 * تعليق على مقال أو فيديو في S08 — «نبض»: نفس بطاقة السؤال، وتحتها «اعتماد» و«رفض».
 *
 * كانت بلا زرّ لأنّ عقد الجوّال لم يكن فيه قرار للتعليقات؛ ومنذ ٥ أكتوبر ٢٠٢٦ يرنّ الجوال
 * بكل تعليق جديد، فبطاقة ساكنة تعني جرساً بلا شيء يُفعل به. الزرّان يظهران فقط حين يرسل
 * الخادم كلمتيهما — الخادم الأقدم يبقي البطاقة ساكنة كما كانت.
 */
export const AudienceCommentCard = memo(function AudienceCommentCard({ item, approveLabel, rejectLabel, badgeLabel, onDecide }: Props) {
  const { theme } = useAppTheme();
  const [busy, setBusy] = useState<CommentDecision | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decide = useCallback(async (decision: CommentDecision) => {
    if (!onDecide || busy !== null) return;
    setBusy(decision);
    setError(null);
    const failure = await onDecide(item, decision);
    // نجاح ⇐ البطاقة تُزال من القائمة فلا حاجة لإعادة الحالة؛ فشل ⇐ الخطأ مكانه والزرّان يعودان.
    if (failure !== null) { setError(failure); setBusy(null); }
  }, [busy, item, onDecide]);

  const canDecide = Boolean(onDecide && approveLabel && rejectLabel);

  return <TonalCard style={styles.card}>
    <View style={styles.identity}>
      <AudienceAvatar initial={item.initial} />
      <View style={styles.identityCopy}>
        {item.name ? <Text numberOfLines={1} style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text> : null}
        {item.metaLine ? <Text numberOfLines={1} style={[styles.secondary, { color: theme.colors.muted }]}>{rtlLine(item.metaLine)}</Text> : null}
      </View>
      {badgeLabel ? <StatusBadge label={badgeLabel} tone="warning" /> : null}
    </View>
    <Text style={[styles.content, { color: theme.colors.text }]}>{item.content}</Text>
    <Text numberOfLines={1} style={[styles.secondary, { color: theme.colors.muted }]}>{item.articleLine}</Text>
    {error ? <Text style={[styles.secondary, { color: theme.colors.danger }]}>{error}</Text> : null}
    {canDecide ? <View style={styles.actions}>
      <PillButton label={approveLabel ?? ''} icon="check" size="medium" disabled={busy !== null} onPress={() => void decide('approve')} accessibilityLabel={`${approveLabel} ${item.name ?? ''}`.trim()} />
      <PillButton label={rejectLabel ?? ''} icon="close" tone="ghost" size="medium" disabled={busy !== null} onPress={() => void decide('reject')} accessibilityLabel={`${rejectLabel} ${item.name ?? ''}`.trim()} />
    </View> : null}
  </TonalCard>;
});

const styles = StyleSheet.create({
  card: { gap: spacing.xs, marginBottom: spacing.sm },
  identity: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm },
  identityCopy: { flex: 1, minWidth: 0 },
  name: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  content: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  actions: { flexDirection: 'row-reverse', gap: spacing.sm, marginTop: spacing.xxs },
});
