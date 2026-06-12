import { Skeleton } from "@/components/ui/skeleton";

/**
 * Fallback for the deferred body (nav + 2-col grid) ONLY — no hero. The hero is
 * rendered for real in the static shell (ClientHeroBlock) and never swaps, so the
 * above-the-fold area is stable (zero CLS). This skeleton sits below the real hero
 * and is replaced by the streamed body; its swap happens below the fold.
 */
export function ClientBodySkeleton() {
  return (
    <div className="w-full">
      {/* Section nav bar */}
      <div className="mx-auto mt-4 flex max-w-[1128px] gap-4 overflow-hidden px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 shrink-0 rounded" />
        ))}
      </div>

      {/* Body — 2-col grid [1fr_290px] (main + sidebar) */}
      <div className="px-4 py-5 sm:px-5">
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_290px]">
          {/* MAIN */}
          <div className="flex min-w-0 flex-col gap-[18px]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-[18px]">
                <Skeleton className="mb-4 h-6 w-40 rounded" />
                <Skeleton className="mb-2 h-4 w-full rounded" />
                <Skeleton className="mb-2 h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </div>
            ))}
          </div>

          {/* SIDEBAR */}
          <aside className="flex flex-col gap-[18px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-[18px]">
                <Skeleton className="mb-3 h-5 w-28 rounded" />
                <Skeleton className="mb-2 h-3 w-full rounded" />
                <Skeleton className="h-3 w-3/4 rounded" />
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
