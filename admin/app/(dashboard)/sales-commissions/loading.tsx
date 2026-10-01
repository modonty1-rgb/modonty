import { Skeleton } from "@/components/ui/skeleton";

/** Matches the page: title line, then the rep cards two per row. */
export default function SalesCommissionsLoading() {
  return (
    <div dir="rtl" className="space-y-4 px-4 pb-6 sm:px-5" aria-hidden>
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3.5 w-[28rem] max-w-full" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
