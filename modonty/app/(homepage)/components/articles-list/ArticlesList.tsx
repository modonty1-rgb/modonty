'use client';

import { useSearchParams } from 'next/navigation';
import { PostCard } from '@/components/feed/postcard/PostCard';
import { MoreArticles } from '@/app/(homepage)/components/articles-list/MoreArticles';
import { MoreArticlesOnScroll } from '@/app/(homepage)/components/articles-list/MoreArticlesOnScroll';
import type { FeedPost } from '@/lib/types';

interface ArticlesListProps {
  serverPosts: FeedPost[];
}

export function ArticlesList({ serverPosts }: ArticlesListProps) {
  const searchParams = useSearchParams();
  const client = searchParams.get('client') ?? undefined;
  const category = searchParams.get('category') ?? undefined;

  // Client filter wins over category — it's the more specific intent.
  if (client) {
    return (
      <MoreArticles
        initialPosts={[]}
        initialStartIndex={0}
        clientSlug={client}
        initialPage={0}
      />
    );
  }

  if (category) {
    return (
      <MoreArticles
        initialPosts={[]}
        initialStartIndex={0}
        categorySlug={category}
        initialPage={0}
      />
    );
  }

  return (
    <>
      {serverPosts.length > 0 && (
        <div className="space-y-4">
          {serverPosts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} className="animate-in fade-in duration-300" />
          ))}
        </div>
      )}
      <MoreArticlesOnScroll
        initialStartIndex={serverPosts.length}
        initialPage={1}
      />
    </>
  );
}
