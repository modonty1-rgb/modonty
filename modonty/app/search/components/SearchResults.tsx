import { PostCard } from "@/components/PostCard";
import { SearchEmptyState } from "./SearchEmptyState";
import { SearchNoQueryState } from "./SearchNoQueryState";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  slug: string;
  publishedAt: Date;
  clientName: string;
  clientSlug: string;
  clientLogo?: string;
  readingTimeMinutes?: number;
  author: {
    id: string;
    name: string;
    title: string;
    company: string;
    avatar: string;
  };
  likes: number;
  dislikes: number;
  comments: number;
  favorites: number;
  status: "published" | "draft";
}

interface SearchResultsProps {
  posts: Post[];
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
        {posts.map((post) => (
          <PostCard key={post.id} post={post} priority={false} />
        ))}
      </div>
    </section>
  );
}
