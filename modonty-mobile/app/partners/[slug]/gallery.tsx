import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState, StateView } from '@/components/ui/StateView';
import { useResource } from '@/hooks/useResource';
import { moreContentApi } from '@/services/api-content';
import { radius, space } from '@/theme/tokens';

/**
 * S09e — صور الشريك (C13 gallery). كل صورة بنسبتها الحقيقية بعرض الشاشة — بلا قصّ (معيار المعرض:
 * لا قصّ ولا فراغات؛ على الجوّال الصفّ صورة واحدة).
 */
export default function PartnerGalleryScreen() {
  const { slug, name } = useLocalSearchParams<{ slug: string; name?: string }>();
  const res = useResource((signal) => moreContentApi.partnerGallery(slug, signal), [slug]);
  return (
    <Screen>
      <Header back title={name ? `صور ${name}` : 'الصور'} />
      {res.status === 'loading' ? (
        <ListSkeleton />
      ) : res.status === 'error' || !res.data ? (
        <ErrorState error={res.error} onRetry={res.reload} what="الصور" />
      ) : res.data.items.length === 0 ? (
        <StateView icon="gallery" title="لا صور بعد" />
      ) : (
        <FlashList
          data={res.data.items}
          keyExtractor={(g) => g.url}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.gap} />}
          renderItem={({ item }) => (
            <Image cachePolicy="memory-disk" source={item.url} style={[styles.image, { aspectRatio: item.width && item.height ? item.width / item.height : 4 / 3 }]} contentFit="contain" accessibilityLabel={item.alt} transition={200} />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: space.screen },
  gap: { height: space.listGap },
  image: { width: '100%', borderRadius: radius.image },
});
