import { PostCard } from "@/components/feed/postcard/PostCard";
import { SearchEmptyState } from "./SearchEmptyState";
import { SearchNoQueryState } from "./SearchNoQueryState";
import type { FeedPost } from "@/lib/types";

interface SearchResultsProps {
  posts: FeedPost[];
  query: string;
  resultsCountText: string;
}

export function SearchResults({
  posts,
  query,
  resultsCountText,
}: SearchResultsProps) {
  if (!query) {
    return (
      <section aria-labelledby="search-results-heading">
        <h2 id="search-results-heading" className="sr-only">
          نتائج البحث
        </h2>
        <SearchNoQueryState />
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section aria-labelledby="search-results-heading">
        <h2 id="search-results-heading" className="sr-only">
          نتائج البحث
        </h2>
        <SearchEmptyState query={query} />
      </section>
    );
  }

  return (
    <section aria-labelledby="search-results-heading">
      <h2 id="search-results-heading" className="sr-only">
        نتائج البحث
      </h2>
      {resultsCountText && (
        <p className="text-sm text-muted-foreground mb-4">{resultsCountText}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            index={index}
            priority={index < 5}
            isLcp={false}
          />
        ))}
      </div>
    </section>
  );
}
