import { useLocalSearchParams } from 'expo-router';

import { ArchiveForTerm } from '@/components/content/ArchiveForTerm';
import { TermHeader } from '@/components/content/TermHeader';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateView';
import { useResource } from '@/hooks/useResource';
import { plainNumber } from '@/lib/format';
import { moreContentApi } from '@/services/api-content';

/** S06b — صفحة وسم (C9 + مقالاته من C3 `?tag=`). */
export default function TagScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const res = useResource((signal) => moreContentApi.tag(slug, signal), [slug]);
  const d = res.data;
  return (
    <Screen>
      <Header back title={d ? `#${d.tag.name}` : undefined} />
      {res.status === 'loading' ? (
        <ListSkeleton />
      ) : res.status === 'error' || !d ? (
        <ErrorState error={res.error} onRetry={res.reload} what="الوسم" />
      ) : (
        <ArchiveForTerm
          filter={{ tag: slug }}
          what="مقالات الوسم"
          header={
            <TermHeader
              name={`#${d.tag.name}`}
              description={d.tag.description}
              image={d.tag.socialImage}
              imageAlt={d.tag.socialImageAlt}
              meta={`${plainNumber(d.articleCount)} مقال`}
              partners={d.partners.map((p) => ({ id: p.id, name: p.name, slug: p.slug, logo: p.logo, line: p.slogan ?? p.city }))}
            />
          }
        />
      )}
    </Screen>
  );
}
