import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ArticleCard } from '@/components/content/ArticleCard';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState, StateView } from '@/components/ui/StateView';
import { useResource } from '@/hooks/useResource';
import { articleRow } from '@/lib/models';
import { open } from '@/lib/nav';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { miscApi } from '@/services/api-actions';
import { moreContentApi } from '@/services/api-content';
import type { AlertTopicId } from '@/services/api-types-actions';
import { toApiError } from '@/services/errors';
import { media, radius, space } from '@/theme/tokens';

/** S34b — قطاع (V3 — getSectorHero + getSectorArticles) + «نبّهني» (enableTopicAlert). */
export default function SectorScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const { requireAuth } = useAuth();
  const toast = useToast();
  const res = useResource((signal) => moreContentApi.sector(key, signal), [key]);
  const d = res.data;

  const alert = () =>
    requireAuth(async () => {
      try {
        const r = await miscApi.topicAlert(key as AlertTopicId);
        toast.show(r.alreadyEnabled ? 'التنبيه مفعّل من قبل' : 'سننبّهك بجديد هذا القطاع', 'success');
      } catch (error) {
        toast.show(toApiError(error).message, 'error');
      }
    });

  return (
    <Screen>
      <Header back title={d?.label} />
      {res.status === 'loading' ? (
        <ListSkeleton />
      ) : res.status === 'error' || !d ? (
        <ErrorState error={res.error} onRetry={res.reload} what="القطاع" />
      ) : d.paused ? (
        <StateView icon="clock" title="قريباً" body={`قطاع ${d.label} قيد الإعداد.`} actionLabel="نبّهني عند الإطلاق" onAction={alert} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {d.hero?.mobile ?? d.hero?.desktop ? (
            <Image cachePolicy="memory-disk" source={(d.hero.mobile ?? d.hero.desktop)!.src} style={styles.hero} contentFit="cover" accessibilityLabel={(d.hero.mobile ?? d.hero.desktop)!.alt} />
          ) : null}
          {d.hero?.title ? <AppText variant="pageTitle">{d.hero.title}</AppText> : null}
          {d.hero?.subtitle ? (
            <AppText variant="body" tone="muted">
              {d.hero.subtitle}
            </AppText>
          ) : null}
          <Button label="نبّهني بجديد القطاع" kind="outlined" icon="notifications" onPress={alert} />
          <View style={styles.list}>
            {d.articles.length === 0 ? (
              <StateView icon="articles" title="لا مقالات مختارة بعد" />
            ) : (
              d.articles.map((a) => <ArticleCard key={a.id} item={articleRow({ id: a.id, slug: a.slug, title: a.title, excerpt: a.summary, image: a.image })} onOpen={open.article} />)
            )}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.screen, gap: space.md, paddingBottom: space.xxl },
  hero: { width: '100%', aspectRatio: media.articleAspect, borderRadius: radius.image },
  list: { gap: space.listGap },
});
