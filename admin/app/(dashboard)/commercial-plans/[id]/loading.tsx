import { Skeleton } from "@/components/ui/skeleton";

export default function CommercialPlanDetailLoading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-12" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-7 w-48" />
          <div className="mt-1 flex gap-2">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-6 w-32 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}
