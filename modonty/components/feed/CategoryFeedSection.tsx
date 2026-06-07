'use client';

import { useSearchParams } from 'next/navigation';
import { PostCard } from '@/components/feed/postcard/PostCard';
import { InfiniteArticleList } from '@/components/feed/infiniteScroll/InfiniteArticleList';
import { InfiniteArticleListOnView } from '@/components/feed/infiniteScroll/InfiniteArticleListOnView';
import type { FeedPost } from '@/lib/types';

interface CategoryFeedSectionProps {
  serverPosts: FeedPost[];
}

export function CategoryFeedSection({ serverPosts }: CategoryFeedSectionProps) {
  const searchParams = useSearchParams();
  const client = searchParams.get('client') ?? undefined;
  const category = searchParams.get('category') ?? undefined;

  // Client filter wins over category — it's the more specific intent.
  if (client) {
    return (
      <InfiniteArticleList
        initialPosts={[]}
        initialStartIndex={0}
        clientSlug={client}
        initialPage={0}
      />
    );
  }

  if (category) {
    return (
      <InfiniteArticleList
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
            <PostCard
              key={post.id}
              post={post}
              index={index}
              className="animate-in fade-in duration-300"
            />
          ))}
        </div>
      )}
      <InfiniteArticleListOnView
        initialStartIndex={serverPosts.length}
        initialPage={1}
      />
    </>
  );
}
