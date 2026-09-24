import { Skeleton } from "@/components/ui/skeleton";

/**
 * `/about` renders `ABOUT_BLOCKS` with no frame: the about intro (`max-w-[1128px] px-6 py-16`:
 * eyebrow · title · line) and the closing call-to-action band. It drew a 2+1 column grid of
 * cards until 24 Sep 2026 — a layout this page has not had since the partner templates.
 */
export default function ClientAboutLoading() {
  return (
    <div aria-hidden>
      <div className="mx-auto max-w-[1128px] px-6 py-16">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-3 h-9 w-80" />
        <Skeleton className="mt-3 h-4 w-40" />
        <div className="mt-8 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="mx-auto max-w-[1128px] px-6 py-12">
        <Skeleton className="h-[88px] w-full rounded-xl" />
      </div>
    </div>
  );
}
