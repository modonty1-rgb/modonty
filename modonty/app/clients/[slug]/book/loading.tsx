import { Skeleton } from "@/components/ui/skeleton";

export default function BookingLoading() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6" dir="rtl">
      <Skeleton className="mb-4 h-5 w-40" />
      <div className="rounded-2xl border border-border bg-card p-5">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <div className="mt-6 space-y-5">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
