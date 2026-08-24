import { Fragment } from 'react';

import { PostCard } from '@/components/feed/postcard/PostCard';
import { AskModo } from '@/components/shared/ask-modo/AskModo';
import { ReelsCard } from '@/components/shared/reels-card/ReelsCard';
import { MoreArticlesOnScroll } from '@/app/(site)/(homepage)/components/articles-list/MoreArticlesOnScroll';
import { FEED_PAGE_SIZE } from '@/lib/queries/feed-constants';
import type { ReelItem } from '@/components/shared/reels-card/ReelsCard';
import type { FeedPost } from '@/lib/types';

interface ArticlesListProps {
  serverPosts: FeedPost[];
  /** Chunk these posts belong to; the scroll continues from the next one. */
  page: number;
  /** Small-laptop reels card, rendered inside the feed after the second article. */
  reels: ReelItem[];
}

// Server component on purpose: the cards render to HTML once instead of being
// serialized a second time into a client boundary. It used to be 'use client' for a
// useSearchParams filter (?client= / ?category=) whose producers — the discovery
// sheets — were removed; nothing links to those URLs anymore.
export function ArticlesList({ serverPosts, page, reels }: ArticlesListProps) {
  return (
    <>
      {serverPosts.length > 0 && (
        <div className="space-y-4">
          {serverPosts.map((post, index) => (
            <Fragment key={post.id}>
              {/* The first card of chunk 1 is the phone feed's one cover-on-top «واجهة» card
                  (Khalid, 23 Aug — hybrid mockup approved); chunk n≥2 and every other card
                  stay compact. Desktop ignores the flag. */}
              {/* `featured` on the first card of page 1 only. The prop existed on the card and
                  was never passed by anyone, so every card rendered identically — measured
                  24 Aug: 2 distinct looks across 8 cards, and nothing told the eye where to
                  start. A feed where everything is emphasised emphasises nothing. */}
              <PostCard post={post} index={index} featured={page === 1 && index === 0} mobileHero={page === 1 && index === 0} className="animate-in fade-in duration-300" />
              {/* Modo's doorway on the phone, IN the feed after the second card (Khalid, 23 Aug:
                  «pure article» homepage — the fixed bottom bar is gone from `/`, and Modo
                  moved from that bar into the flow). Page 1 only, so the series shows it once;
                  `lg:hidden` because the desktop rails already carry Modo. `rounded-2xl` matches
                  the mobile card it sits between. */}
              {page === 1 && index === 1 && <AskModo className="rounded-2xl lg:hidden" />}
              {/* Reels, on small laptops only, AFTER the second article — not above the feed.
                  In the 1024-1239px band the far rail is hidden, so this card is the only route
                  to the reels; but sitting first it pushed the opening article from y=225 to
                  y=389 (measured 24 Aug at 1100px), so the reader met reels before reading
                  anything. Same placement Modo already uses on phones: the feed opens with an
                  article, and the side offer arrives once the reader is in it. */}
              {page === 1 && index === 1 && (
                <div className="hidden lg:block min-[1240px]:hidden">
                  <ReelsCard items={reels} layout="feed" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}
      {/* Absolute index of the first scrolled-in card = everything the series showed before it. */}
      <MoreArticlesOnScroll initialStartIndex={(page - 1) * FEED_PAGE_SIZE + serverPosts.length} initialPage={page} />
    </>
  );
}
