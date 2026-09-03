import { Skeleton } from "@/components/ui/skeleton";

/** Matches the real layout: header, four tiles, filter chips, then rows. */
export default function Loading() {
  return (
    <div dir="rtl" className="space-y-5 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[58px] rounded-lg" />
        ))}
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>

      <Skeleton className="h-10 w-full max-w-sm rounded-md" />
      <div className="space-y-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
