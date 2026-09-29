import { Skeleton } from "@/components/ui/skeleton";

/** Same grid as the four summary cards and the «وش جبنا» cards — so the page does not jump when data lands. */
export function SummarySkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border bg-card p-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg border bg-card p-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** The campaigns table: header strip and six rows in the same five columns. */
export function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card" aria-hidden>
      <Skeleton className="h-8 w-full rounded-none" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid grid-cols-2 items-center gap-3 border-b px-4 py-3 last:border-b-0 lg:grid-cols-[minmax(0,2.2fr)_6rem_7rem_minmax(0,1.4fr)_minmax(0,1.2fr)]">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-14" />
          <Skeleton className="hidden h-4 w-16 lg:block" />
          <Skeleton className="hidden h-4 w-24 lg:block" />
          <Skeleton className="hidden h-4 w-20 lg:block" />
        </div>
      ))}
    </div>
  );
}
