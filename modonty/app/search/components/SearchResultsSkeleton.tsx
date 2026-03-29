import { Skeleton } from "@/components/ui/skeleton";
import { InfiniteFeedSkeleton } from "@/components/feed/infiniteScroll/InfiniteFeedSkeleton";

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfiniteFeedSkeleton count={6} />
      </div>
    </div>
  );
}
