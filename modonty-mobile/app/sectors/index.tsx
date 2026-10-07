import { router } from 'expo-router';

import { InfoRow } from '@/components/content/InfoRow';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SimpleList } from '@/components/ui/SimpleList';
import { moreContentApi } from '@/services/api-content';
import type { SectorsData } from '@/services/api-types-content';

type Sector = SectorsData['items'][number];

/** S34 — قطاعات مدونتي (V3 — LIVE_SECTORS من shared). المتوقّف يُعرض «قريباً» كالويب. */
export default function SectorsScreen() {
  return (
    <Screen>
      <Header back title="قطاعات مدونتي" />
      <SimpleList<Sector>
        load={async (signal) => (await moreContentApi.sectors(signal)).items}
        renderItem={({ item }) => <InfoRow icon="keypoints" title={item.label} badge={item.paused ? 'قريباً' : null} onPress={() => router.push({ pathname: '/sectors/[key]', params: { key: item.key } })} />}
        keyOf={(s) => s.key}
        what="القطاعات"
        empty={{ icon: 'keypoints', title: 'لا قطاعات منشورة' }}
      />
    </Screen>
  );
}
