import { Skeleton } from "@/components/ui/skeleton";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";

/**
 * The archive skeleton — drawn through the SAME shell the page uses (`ArticlesPageLayout`:
 * `ThreeColumnLayout` with a 220px categories rail, the feed, and a 300px «about» rail).
 *
 * It drew `TwoColumnLayout` until 24 Sep 2026 — after the page had moved to three columns.
 * Measured at 1280px: skeleton 780/300, page 220/544/300, so every desktop load rearranged
 * itself once the data landed. Only the rails' own width/visibility classes are repeated here,
 * verbatim from `ArticlesPageLayout.tsx`.
 */

/** Verbatim from `ArticlesPageLayout.tsx` — categories rail. */
const RIGHT_RAIL = "hidden w-[220px] shrink-0 self-start min-[1240px]:block";
/** Verbatim from `ArticlesPageLayout.tsx` — «about» rail. */
const LEFT_RAIL = "hidden w-[300px] shrink-0 self-start min-[1240px]:block";

export default function ArticlesLoading() {
  return (
    <ThreeColumnLayout
      header={<Skeleton className="h-4 w-32" />}
      right={
        <div className={RIGHT_RAIL} aria-hidden>
          <Skeleton className="h-[420px] w-full rounded-lg" />
        </div>
      }
      center={
        <>
          {/* `ArticlesHeader` — visible below 1240px only (sr-only above). */}
          <div className="space-y-2 min-[1240px]:hidden">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          {/* `FiltersBar` chips — below 1240px, where the rail is hidden. */}
          <div className="flex gap-2 overflow-hidden min-[1240px]:hidden">
            {[88, 120, 104, 132, 96].map((w, i) => (
              <Skeleton key={i} className="h-9 shrink-0 rounded-full" style={{ width: w }} />
            ))}
          </div>
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="hidden h-4 w-20 min-[1240px]:block" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-11 w-[96px] rounded-lg" />
              ))}
            </div>
          </div>
          {/* `PostCard` — publisher line, 16:9 cover, two title lines. */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-card p-3 ring-1 ring-border">
              <div className="mb-3 flex items-center gap-2">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <Skeleton className="h-3.5 w-32" />
              </div>
              <Skeleton className="aspect-video w-full rounded-lg" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </>
      }
      left={
        <div className={`${LEFT_RAIL} space-y-3`} aria-hidden>
          <Skeleton className="h-[130px] w-full rounded-lg" />
          <Skeleton className="h-[120px] w-full rounded-lg" />
          <Skeleton className="h-[90px] w-full rounded-lg" />
        </div>
      }
    />
  );
}
