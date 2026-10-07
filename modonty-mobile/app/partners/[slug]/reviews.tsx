import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { IconButton } from '@/components/ui/IconButton';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { Stars } from '@/components/ui/Stars';
import { TextField } from '@/components/ui/TextField';
import { usePagedList } from '@/hooks/usePagedList';
import { fieldErrors } from '@/lib/field-errors';
import { fullDate, plainNumber } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { partnerActionsApi } from '@/services/api-actions';
import { moreContentApi } from '@/services/api-content';
import type { PartnerReview } from '@/services/api-types-content';
import { ApiError, toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

/** S09d — تقييمات الشريك (C13 المعتمدة فقط) + كتابة تقييم (E12 — يُنشر بعد المراجعة). */
export default function PartnerReviewsScreen() {
  const { slug, name } = useLocalSearchParams<{ slug: string; name?: string }>();
  const { colors } = useAppTheme();
  const { requireAuth } = useAuth();
  const toast = useToast();
  const [summary, setSummary] = useState<{ total: number; average: number } | null>(null);
  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const errors = fieldErrors(error);

  const list = usePagedList<PartnerReview, number>(
    async (page, signal) => {
      const p = page ?? 1;
      const d = await moreContentApi.partnerReviews(slug, p, signal);
      if (p === 1) setSummary({ total: d.total, average: d.averageRating });
      return { items: d.items, next: d.hasMore ? p + 1 : null };
    },
    [slug],
  );

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await partnerActionsApi.review(slug, { rating, comment: comment.trim() });
      toast.show(r.message, 'success');
      setWriting(false);
      setRating(0);
      setComment('');
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header back title={name ? `تقييمات ${name}` : 'التقييمات'} />
      <PagedList
        list={list}
        skeleton="row"
        header={
          <View style={styles.head}>
            {summary && summary.total > 0 ? (
              <View style={styles.summary}>
                <AppText variant="numeral">{summary.average.toFixed(1)}</AppText>
                <Stars value={summary.average} />
                <AppText variant="secondary" tone="muted">{`${plainNumber(summary.total)} تقييم`}</AppText>
              </View>
            ) : null}
            <Button label="اكتب تقييماً" kind="outlined" icon="rating" onPress={() => requireAuth(() => setWriting(true))} />
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.review, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.row}>
              <AppText variant="label" style={styles.flex}>
                {item.author?.name ?? 'عميل'}
              </AppText>
              <Stars value={item.rating} />
            </View>
            <AppText variant="body">{item.comment}</AppText>
            <AppText variant="secondary" tone="muted">
              {fullDate(item.createdAt)}
            </AppText>
          </View>
        )}
        keyOf={(r) => r.id}
        what="التقييمات"
        empty={{ icon: 'rating', title: 'لا تقييمات منشورة بعد', body: 'شارك تجربتك مع هذا الشريك.' }}
      />
      <Portal>
        <Modal visible={writing} onDismiss={() => setWriting(false)} contentContainerStyle={[styles.sheet, { backgroundColor: colors.page }]}>
          <View style={styles.row}>
            <AppText variant="sectionTitle" style={styles.flex}>
              تقييمك
            </AppText>
            <IconButton icon="close" label="إغلاق" onPress={() => setWriting(false)} />
          </View>
          <View style={styles.pick}>
            {[1, 2, 3, 4, 5].map((n) => (
              <IconButton key={n} icon="rating" label={`${n} من ٥`} selected={rating >= n} tone={rating >= n ? 'text' : 'border'} onPress={() => setRating(n)} />
            ))}
          </View>
          {errors.rating ? (
            <AppText variant="secondary" tone="danger">
              {errors.rating}
            </AppText>
          ) : null}
          <TextField label="تجربتك" value={comment} onChangeText={setComment} multiline error={errors.comment} />
          {error && Object.keys(errors).length === 0 ? (
            <AppText variant="label" tone="danger">
              {error.message}
            </AppText>
          ) : null}
          <Button label="أرسل التقييم" onPress={() => void submit()} busy={busy} busyLabel="يُرسل…" disabled={rating === 0 || !comment.trim()} />
        </Modal>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.screen, paddingTop: space.md, gap: space.md },
  summary: { alignItems: 'center', gap: space.xxs },
  review: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.card, gap: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  flex: { flex: 1 },
  sheet: { margin: space.screen, borderRadius: radius.card, padding: space.md, gap: space.sm },
  pick: { flexDirection: 'row', justifyContent: 'center', minHeight: control.touch },
});
