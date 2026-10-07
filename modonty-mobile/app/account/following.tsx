import { router } from 'expo-router';

import { PartnerCard } from '@/components/content/PartnerCard';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SimpleList } from '@/components/ui/SimpleList';
import { plainNumber } from '@/lib/format';
import type { PartnerCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { accountApi } from '@/services/api';

/** S18 — الشركاء الذين أتابعهم (A13 following — getProfileFollowing). */
export default function FollowingScreen() {
  return (
    <Screen>
      <Header back title="الشركاء الذين أتابعهم" />
      <SimpleList<PartnerCardModel>
        load={async (signal) =>
          (await accountApi.following(signal)).items.map((c) => ({
            key: c.id,
            slug: c.slug,
            name: c.name,
            logo: c.logo,
            line: c.description,
            meta: [c.industry?.name, `${plainNumber(c.articleCount)} مقال`].filter(Boolean).join(' · '),
            verified: false,
            rating: null,
          }))
        }
        renderItem={({ item }) => <PartnerCard item={item} onOpen={open.partner} />}
        keyOf={(p) => p.key}
        what="المتابَعين"
        empty={{ icon: 'partner', title: 'لا تتابع أيّ شريك بعد', body: 'تابع شريكاً ليصلك جديده.', actionLabel: 'دليل الشركاء', onAction: () => router.push('/partners') }}
      />
    </Screen>
  );
}
