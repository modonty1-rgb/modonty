import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ArticleCard } from '@/components/content/ArticleCard';
import { AudioPlayer } from '@/components/content/AudioPlayer';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SimpleList } from '@/components/ui/SimpleList';
import { articleRow, type ArticleCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { moreContentApi } from '@/services/api-content';
import { space } from '@/theme/tokens';

type Row = ArticleCardModel & { audioUrl: string; durationSeconds: number | null };

/** S33 — مقالات مسموعة (C19 audio — getAudioArticles): الاستماع من القائمة مباشرة، مشغّل واحد في كل مرّة. */
export default function AudioScreen() {
  const [playing, setPlaying] = useState<string | null>(null);
  return (
    <Screen>
      <Header back title="مقالات مسموعة" />
      <SimpleList<Row>
        load={async (signal) =>
          (await moreContentApi.audio(signal)).items.map((a) => ({
            ...articleRow({ id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt, image: a.image, imageBlur: a.imageBlur, publisher: a.clientName, date: a.publishedAt, readingTimeMinutes: a.readingTimeMinutes, hasAudio: true }),
            audioUrl: a.audioUrl,
            durationSeconds: a.durationSeconds ?? null,
          }))
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ArticleCard item={item} onOpen={open.article} layout="row" />
            {playing === item.key ? (
              <AudioPlayer url={item.audioUrl} durationSeconds={item.durationSeconds} />
            ) : (
              <Button label="استمع" kind="text" icon="play" compact onPress={() => setPlaying(item.key)} />
            )}
          </View>
        )}
        keyOf={(a) => a.key}
        what="المقالات المسموعة"
        empty={{ icon: 'audio', title: 'لا مقالات مسموعة بعد' }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ item: { gap: space.xs, alignItems: 'stretch' } });
