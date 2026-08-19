import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the real single column, so nothing jumps when the data lands.
 *
 * It was still drawing the old three-column shell after the page became one column — a skeleton
 * that lies about the layout is worse than none, because it guarantees the shift it exists to
 * prevent.
 */
export default function ArticlesLoading() {
  return (
    <div className="container mx-auto max-w-[760px] px-3 py-3 sm:px-4 sm:py-6">
      <div className="mb-5 space-y-4">
        <Skeleton className="h-5 w-44" />

        {/* chips */}
        <div className="flex flex-wrap gap-2">
          {[88, 120, 104, 132, 96, 112, 100].map((w, i) => (
            <Skeleton key={i} className="h-9 rounded-full" style={{ width: w }} />
          ))}
        </div>

        {/* reading-time buttons */}
        <div className="flex flex-wrap gap-2">
          {[150, 150, 158].map((w, i) => (
            <Skeleton key={i} className="h-11 rounded-lg" style={{ width: w }} />
          ))}
        </div>

        <Skeleton className="h-[72px] w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 border-t border-border p-3 first:border-t-0">
            <Skeleton className="h-[72px] w-[128px] shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
