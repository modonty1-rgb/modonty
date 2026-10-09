import { Skeleton } from "@/components/ui/skeleton";

/** يحاكي لوحة العملاء: رأس + شريط أدوات + شبكة كروت. */
export default function SocialCalendarLoading() {
  return (
    <div dir="rtl" className="mx-auto max-w-7xl space-y-4">
      <div className="flex items-center justify-between rounded-xl border bg-card px-6 py-5">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border bg-card p-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-8 w-10" />
              <Skeleton className="h-8 w-10" />
            </div>
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
