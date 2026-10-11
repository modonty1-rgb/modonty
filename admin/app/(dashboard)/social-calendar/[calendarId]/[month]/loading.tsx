import { Skeleton } from "@/components/ui/skeleton";

/** يحاكي التقويم: رأس، جدول أيام، شريط ملخّص سفلي، وشريط الشهور على اليسار. */
export default function ClientCalendarLoading() {
  return (
    <div dir="rtl" className="-m-4 flex h-[calc(100%+2rem)] flex-col sm:-m-6 sm:h-[calc(100%+3rem)]">
      <div className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-96 rounded-lg" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex-1 space-y-3 p-4">
          <Skeleton className="h-8 w-full rounded-md" />
          <div className="space-y-1 rounded-xl border p-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        </div>
        <div className="w-40 space-y-1.5 border-r bg-card p-2">
          <Skeleton className="h-8 w-full rounded-md" />
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
