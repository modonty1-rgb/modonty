import { Skeleton } from "@/components/ui/skeleton";

/**
 * The article page's own shape, held while it loads.
 *
 * It used to draw a three-column grid — `lg:grid-cols-[240px_1fr_280px]` with its own container
 * padding — left over from a layout this page stopped using. So the reader watched a frame
 * appear, then jump into a different one (Khalid, 19 Aug: «السكيلتون تمامه خاطئ»).
 *
 * The rule for this file: it mirrors `page.tsx`, block for block. Same shell
 * (`TwoColumnLayout`'s container, padding and gaps, copied literally), same order — breadcrumb ·
 * title · excerpt · byline · meta · summary · cover · body — and the same rail: partner strip
 * above the contents card. When the page's structure changes, this changes with it in the same
 * commit, or it goes back to lying.
 */
export default function ArticleLoading() {
  return (
    <div className="[&_.animate-pulse]:!bg-muted-foreground/15">
      {/* reading progress bar */}
      <Skeleton className="h-1 w-full" />

      {/* Same container as TwoColumnLayout — not this file's own guess at one. */}
      <div className="container mx-auto max-w-[1128px] px-3 py-3 sm:px-4 sm:py-6">
        {/* breadcrumb */}
        <Skeleton className="mb-4 h-4 w-72 max-w-full" />

        <div className="flex flex-col items-start gap-6 lg:flex-row lg:justify-center min-[1240px]:gap-4 min-[1296px]:gap-6">
          {/* MAIN — the article column */}
          <div className="mx-auto w-full space-y-3 sm:space-y-4 lg:mx-0 lg:flex-1">
            {/* the four action tabs, mobile placement */}
            <div className="mb-6 flex gap-2 lg:hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="size-12 rounded-b-xl" />
              ))}
            </div>

            {/* reading tools, mobile/tablet placement */}
            <Skeleton className="h-11 w-full rounded-xl xl:hidden" />

            {/* title — two lines at the real 2.5rem */}
            <div className="space-y-2 pt-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-4/5" />
            </div>

            {/* excerpt */}
            <div className="space-y-2 pt-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-11/12" />
            </div>

            {/* reviewer byline — the bordered line, not a box */}
            <Skeleton className="h-5 w-2/3" />

            {/* meta row: author · date · reading time · words · views */}
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>

            {/* «باختصار» summary box */}
            <div className="space-y-2 rounded-lg border border-border p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* cover image — 16:9, the shape the real one draws */}
            <Skeleton className="aspect-video w-full rounded-lg" />

            {/* body — capped at 68ch like the real prose, so the line length matches */}
            <div className="max-w-[68ch] space-y-3 pt-2">
              <Skeleton className="h-7 w-1/2" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
              <Skeleton className="h-4 w-5/6" />

              <Skeleton className="mt-6 h-7 w-2/5" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* RAIL — 300px, partner strip then contents card, in that order */}
          <aside className="hidden w-[300px] shrink-0 lg:block" aria-hidden="true">
            <div className="flex flex-col gap-4">
              {/* reading tools sit here below xl */}
              <Skeleton className="h-11 w-full rounded-xl xl:hidden" />

              {/* partner strip: avatar + name + one line, then two buttons */}
              <div className="space-y-2.5 rounded-xl border border-border p-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1 rounded-md" />
                  <Skeleton className="h-10 w-24 rounded-md" />
                </div>
              </div>

              {/* contents card */}
              <div className="space-y-2.5 rounded-xl border border-border p-3">
                <Skeleton className="h-4 w-28" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-3.5" style={{ width: `${92 - i * 6}%` }} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
