import { Skeleton } from "@/components/ui/skeleton";

/** Matches the page: header, then one section per device and the per-page table. */
export default function SpeedKpiLoading() {
  return (
    <div className="space-y-5 px-4 pb-6 sm:px-5" aria-hidden>
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-3.5 w-96" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ))}
    </div>
  );
}
