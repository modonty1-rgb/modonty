import { useEffect, useState } from 'react';
import { Keyboard, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { PillButton } from '@/src/components/ui/Nabd';
import { arabicDigits } from '@/src/services/engagement-api';
import { getNpsSurvey, submitNpsAnswer, type NpsAnswer, type NpsSurveyContract } from '@/src/services/nps-api';
import { control, fonts, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const SCORES = Array.from({ length: 11 }, (_, i) => i);

/**
 * استبيان رضا العميل (NPS) — نفس نافذة الكونسول على الويب (خالد ١٥ أكتوبر ٢٠٢٦، على نمط تمارا):
 * سؤال · ١١ مربّعاً ٠–١٠ · «غير مرجّح» و«مرجّح جداً» · إغلاق. بعد الرقم «ليش؟» اختياري ثم شكر.
 *
 * الخادم يقرّر هل يحين (`/nps` → `due`) ويعطي كل النصوص. الإغلاق بلا رقم = تأجيل ١٤ يوماً؛ بعد اختيار
 * رقم = إجابته بلا تعليق. `Modal` لا `Alert` — يعمل على أندرويد والويب كنافذة التأكيد في التطبيق.
 */
export function NpsSurvey({ accessToken }: { accessToken: string }) {
  const { theme } = useAppTheme();
  const c = theme.colors;
  const [copy, setCopy] = useState<NpsSurveyContract | null>(null);
  const [visible, setVisible] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    getNpsSurvey(accessToken)
      .then((s) => { if (alive && s.due) { setCopy(s); setVisible(true); } })
      .catch(() => undefined); // استبيانٌ لا يُحمَّل لا يستحق رسالة خطأ في الرئيسية
    return () => { alive = false; };
  }, [accessToken]);

  if (!copy) return null;

  const send = (answer: NpsAnswer, closeAfter: boolean) => {
    setSending(true);
    setError(false);
    submitNpsAnswer(accessToken, answer)
      .then(() => {
        if (closeAfter) return setVisible(false);
        setDone(true);
        setTimeout(() => setVisible(false), 2500);
      })
      .catch(() => (closeAfter ? setVisible(false) : setError(true)))
      .finally(() => setSending(false));
  };

  const close = () => {
    Keyboard.dismiss();
    if (done) return setVisible(false);
    send(score === null ? { dismissed: true } : { score }, true);
  };

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
    <View style={styles.backdrop}>
      <View accessibilityViewIsModal style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        {done ? <View style={styles.thanks}>
          <ModontyIcon name="check" size={control.iconSize * 1.6} primary={c.accent} />
          <Text style={[styles.title, styles.center, { color: c.text }]}>{copy.thanksTitle}</Text>
          <Text style={[styles.subtitle, styles.center, { color: c.muted }]}>{copy.thanksBody}</Text>
        </View> : <>
          <View style={styles.head}>
            <Text style={[styles.title, styles.flex, { color: c.text }]}>{copy.title}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={copy.closeLabel} onPress={close} hitSlop={spacing.sm} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
              <ModontyIcon name="close" size={control.iconSizeSmall} primary={c.muted} />
            </Pressable>
          </View>
          <Text style={[styles.subtitle, { color: c.muted }]}>{copy.subtitle}</Text>

          {/* ٠ أوّلاً من اليمين — اتّجاه القراءة العربي، كما في الويب */}
          <View style={styles.scores} accessibilityRole="radiogroup">
            {SCORES.map((n) => {
              const on = score === n;
              return <Pressable key={n} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={arabicDigits(n)} disabled={sending} onPress={() => setScore(n)}
                style={({ pressed }) => [styles.score, { borderColor: on ? c.brandFill : c.border, backgroundColor: on ? c.brandFill : 'transparent' }, pressed && styles.pressed]}>
                <Text style={[styles.scoreText, { color: on ? c.onBrandFill : c.text }]}>{arabicDigits(n)}</Text>
              </Pressable>;
            })}
          </View>
          <View style={styles.ends}>
            <Text style={[styles.endLabel, { color: c.muted }]}>{copy.lowLabel}</Text>
            <Text style={[styles.endLabel, { color: c.muted }]}>{copy.highLabel}</Text>
          </View>

          {score !== null ? <View style={styles.more}>
            <Text style={[styles.label, { color: c.text }]}>{copy.commentLabel}</Text>
            <TextInput accessibilityLabel={copy.commentLabel} editable={!sending} multiline maxLength={1000} onChangeText={setComment} value={comment}
              placeholder={copy.commentPlaceholder} placeholderTextColor={c.inputPlaceholder}
              style={[styles.input, { borderColor: c.inputBorder, backgroundColor: c.inputSurface, color: c.text }]} />
            {error ? <Text style={[styles.label, { color: c.errorText }]}>{copy.errorLabel}</Text> : null}
            <PillButton label={sending ? copy.submittingLabel : copy.submitLabel} disabled={sending}
              onPress={() => { Keyboard.dismiss(); send({ score: score!, ...(comment.trim() ? { comment: comment.trim() } : {}) }, false); }} />
            <PillButton label={copy.submitWithoutCommentLabel} tone="ghost" disabled={sending}
              onPress={() => { Keyboard.dismiss(); send({ score: score! }, false); }} />
          </View> : null}
        </>}
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.56)', flex: 1, justifyContent: 'center', paddingHorizontal: spacing.md },
  card: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, maxWidth: spacing.xxl * 14, padding: spacing.lg, width: '100%' },
  head: { alignItems: 'flex-start', flexDirection: 'row-reverse', gap: spacing.sm },
  flex: { flex: 1 },
  close: { alignItems: 'center', height: control.minTouchTarget * 0.75, justifyContent: 'center', width: control.minTouchTarget * 0.75 },
  title: { fontFamily: fonts.bold, fontSize: typography.title, lineHeight: typography.lineHeightTitle, textAlign: 'right', writingDirection: 'rtl' },
  subtitle: { fontFamily: fonts.regular, fontSize: typography.label, lineHeight: typography.lineHeightLabel, marginTop: spacing.xxs, textAlign: 'right', writingDirection: 'rtl' },
  center: { textAlign: 'center' },
  // ١١ مربّعاً على ٣٦٠px: صفّان (٦ + ٥) أوضح من صفٍّ واحد بمربّعات ٢٥px لا يصيبها الإصبع
  scores: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center', marginTop: spacing.md },
  score: { alignItems: 'center', borderRadius: radii.field, borderWidth: 1, height: control.minTouchTarget, justifyContent: 'center', width: control.minTouchTarget },
  scoreText: { fontFamily: fonts.bold, fontSize: typography.body, lineHeight: typography.lineHeightBody },
  pressed: { opacity: 0.72 },
  ends: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: spacing.xs },
  endLabel: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, writingDirection: 'rtl' },
  more: { gap: spacing.sm, marginTop: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  input: { borderRadius: radii.field, borderWidth: 1, fontFamily: fonts.regular, fontSize: typography.body, minHeight: control.inputHeight * 1.8, padding: spacing.sm, textAlign: 'right', textAlignVertical: 'top', writingDirection: 'rtl' },
  thanks: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.lg },
});
