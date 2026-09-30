import { Skeleton } from "@/components/ui/skeleton";

/** Matches the page: header + period switch, then the writer cards. */
export default function ContentKpiLoading() {
  return (
    <div className="space-y-4 px-4 pb-6 sm:px-5" aria-hidden>
      <div className="flex items-end justify-between gap-3 pt-1">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3.5 w-80" />
        </div>
        <Skeleton className="h-9 w-52 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
