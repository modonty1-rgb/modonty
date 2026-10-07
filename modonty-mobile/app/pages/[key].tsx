import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { ArticleHtml } from '@/components/content/ArticleHtml';
import { AppText } from '@/components/ui/AppText';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState, StateView } from '@/components/ui/StateView';
import { useResource } from '@/hooks/useResource';
import { fullDate } from '@/lib/format';
import { moreContentApi } from '@/services/api-content';
import type { StaticPageKey } from '@/services/api-types-content';
import { space } from '@/theme/tokens';

/** S35 — عن مدونتي · الخصوصية · الشروط · اتفاقية المستخدم (C20) — نفس نصّ صفحة الويب من الأدمن. */
export default function StaticPageScreen() {
  const { key } = useLocalSearchParams<{ key: StaticPageKey }>();
  const res = useResource((signal) => moreContentApi.page(key, signal), [key]);
  const d = res.data;
  return (
    <Screen>
      <Header back title={d?.title || undefined} />
      {res.status === 'loading' ? (
        <ListSkeleton kind="row" />
      ) : res.status === 'error' || !d ? (
        <ErrorState error={res.error} onRetry={res.reload} what="الصفحة" />
      ) : !d.html ? (
        <StateView icon="info" title="الصفحة بلا محتوى بعد" />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {d.title ? (
            <AppText variant="pageTitle" accessibilityRole="header">
              {d.title}
            </AppText>
          ) : null}
          {d.updatedAt ? (
            <AppText variant="secondary" tone="muted">
              {`آخر تحديث: ${fullDate(d.updatedAt)}`}
            </AppText>
          ) : null}
          <ArticleHtml html={d.html} />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { padding: space.screen, gap: space.sm, paddingBottom: space.xxl } });
