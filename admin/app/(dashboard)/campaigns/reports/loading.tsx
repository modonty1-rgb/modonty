import { Skeleton } from "@/components/ui/skeleton";
import { SummarySkeleton, TableSkeleton } from "./components/report-skeletons";

/** First open of the report — same header, cards and table as the page, and as the filter skeletons. */
export default function ReportsLoading() {
  return (
    <main dir="rtl" className="mx-auto flex w-full max-w-6xl flex-col gap-4" role="status" aria-label="يحمّل التقرير من ميتا">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <Skeleton className="size-9 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-44" />
        </div>
      </header>
      <SummarySkeleton />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-full max-w-xl" />
        <TableSkeleton />
      </div>
    </main>
  );
}
