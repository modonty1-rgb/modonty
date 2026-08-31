import { Skeleton } from "@/components/ui/skeleton";
import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";

/**
 * The archive skeleton — drawn through the SAME shell the page uses.
 *
 * Two corrections in its history, and the second is why it now takes the shell instead of
 * describing one. It first drew a three-column shell after the page had become narrower;
 * that was replaced by a hand-drawn single column of `max-w-[760px]` — and the page it
 * mirrors is `TwoColumnLayout`: a `max-w-[1128px]` container with a `lg:w-[300px]` rail
 * (`ArticlesPageLayout.tsx:60` and `:110`). So the skeleton was 368px narrower than the
 * page and carried no rail at all, and every desktop load rearranged itself once the data
 * landed — the shift a skeleton exists to prevent, counted against CLS.
 *
 * Taking the shell makes the drift impossible: the container, gaps and column behaviour
 * come from one file. Only the rail's own width classes are repeated, verbatim from the page.
 */

/** Verbatim from `ArticlesPageLayout.tsx:110`. */
const RAIL = "w-full shrink-0 self-start lg:w-[300px]";

export default function ArticlesLoading() {
  return (
    <TwoColumnLayout
      main={
        <>
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
        </>
      }
      rail={
        // The rail stacks under the cards on phones exactly as the real one does, so its
        // height is part of the reserved space there too — not only on desktop.
        <div className={`${RAIL} space-y-4`}>
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
      }
    />
  );
}
