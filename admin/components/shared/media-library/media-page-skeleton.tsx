import { Skeleton } from "@/components/ui/skeleton";

/**
 * The loading state of the section media pages (Clients · Articles · Modonty › Media), drawn
 * in the page's own order — title, pickers and kind toggles, the search toolbar, then the grid
 * with `MediaGrid`'s columns, gap and 4:3 cards. The old one had no filter row or toolbar,
 * so the grid jumped down when the page arrived (28 Sep 2026).
 */
export function MediaPageSkeleton({ pickers = 1 }: { pickers?: number }) {
  return (
    <div className="max-w-[1200px] mx-auto space-y-5" role="status" aria-busy="true" aria-label="Loading">
      <div>
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-3.5 w-80 mt-1.5" />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        {Array.from({ length: pickers }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-[220px]" />
        ))}
        <Skeleton className="h-11 w-[560px] max-w-full" />
        <Skeleton className="h-11 w-28" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-10 flex-1 min-w-[240px]" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
