import { PostCard } from '@/components/feed/postcard/PostCard';
import { MoreArticlesOnScroll } from '@/app/(site)/(homepage)/components/articles-list/MoreArticlesOnScroll';
import { FEED_PAGE_SIZE } from '@/lib/queries/feed-constants';
import type { FeedPost } from '@/lib/types';

interface ArticlesListProps {
  serverPosts: FeedPost[];
  /** Chunk these posts belong to; the scroll continues from the next one. */
  page: number;
}

// Server component on purpose: the cards render to HTML once instead of being
// serialized a second time into a client boundary. It used to be 'use client' for a
// useSearchParams filter (?client= / ?category=) whose producers — the discovery
// sheets — were removed; nothing links to those URLs anymore.
export function ArticlesList({ serverPosts, page }: ArticlesListProps) {
  return (
    <>
      {serverPosts.length > 0 && (
        <div className="space-y-4">
          {serverPosts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} className="animate-in fade-in duration-300" />
          ))}
        </div>
      )}
      {/* Absolute index of the first scrolled-in card = everything the series showed before it. */}
      <MoreArticlesOnScroll initialStartIndex={(page - 1) * FEED_PAGE_SIZE + serverPosts.length} initialPage={page} />
    </>
  );
}
