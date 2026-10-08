import { useLocalSearchParams } from 'expo-router';

import { ArchiveForTerm } from '@/components/content/ArchiveForTerm';
import { TermHeader } from '@/components/content/TermHeader';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateView';
import { useResource } from '@/hooks/useResource';
import { plainNumber } from '@/lib/format';
import { contentApi } from '@/services/api';

/** S05b — صفحة تصنيف (C8 + مقالاته من C3). */
export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const res = useResource((signal) => contentApi.category(slug, signal), [slug]);
  const d = res.data;
  return (
    <Screen>
      <Header back title={d?.category.name} />
      {res.status === 'loading' ? (
        <ListSkeleton />
      ) : res.status === 'error' || !d ? (
        <ErrorState error={res.error} onRetry={res.reload} what="التصنيف" />
      ) : (
        <ArchiveForTerm
          filter={{ category: slug }}
          what="مقالات التصنيف"
          header={
            <TermHeader
              name={d.category.name}
              description={d.category.description}
              image={d.category.socialImage}
              imageAlt={d.category.socialImageAlt}
              meta={`${plainNumber(d.articleCount)} مقال`}
              partners={d.partners.map((p) => ({ id: p.id, name: p.name, slug: p.slug, logo: p.logo, line: p.slogan ?? p.city }))}
            />
          }
        />
      )}
    </Screen>
  );
}
