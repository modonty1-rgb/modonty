import { Skeleton } from "@/components/ui/skeleton";

export default function CommercialPlansLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 pb-8" dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
