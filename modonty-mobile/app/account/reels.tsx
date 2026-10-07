import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ReelTile } from '@/components/content/ReelTile';
import { ChipRow } from '@/components/ui/ChipRow';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SimpleList } from '@/components/ui/SimpleList';
import { open } from '@/lib/nav';
import { meApi } from '@/services/api-actions';
import type { MeReelsData } from '@/services/api-types-actions';
import { space } from '@/theme/tokens';

type Item = MeReelsData['items'][number];

/** S21 — ريلزي (getMyReels): ما أعجبني وما حفظته. */
export default function MyReelsScreen() {
  const [kind, setKind] = useState<'LIKE' | 'FAVORITE'>('FAVORITE');
  const { width } = useWindowDimensions();
  const tile = (width - space.screen * 2 - space.listGap) / 2;
  return (
    <Screen>
      <Header back title="ريلزي" />
      <SimpleList<Item>
        deps={[kind]}
        load={async (signal) => (await meApi.reels(kind, signal)).items}
        header={
          <ChipRow
            label="القائمة"
            options={[
              { value: 'FAVORITE', label: 'المحفوظة' },
              { value: 'LIKE', label: 'أعجبتني' },
            ]}
            value={kind}
            onChange={setKind}
          />
        }
        skeleton="card"
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <ReelTile item={{ key: item.id, slug: item.slug ?? item.id, title: item.title, poster: item.imageUrl, publisher: item.clientName, isVideo: false }} onOpen={open.reel} width={tile} />
          </View>
        )}
        keyOf={(i) => i.id}
        what="ريلزك"
        empty={{ icon: 'reels', title: kind === 'FAVORITE' ? 'لم تحفظ ريلاً بعد' : 'لم يعجبك ريل بعد' }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ cell: { alignItems: 'flex-start' } });
