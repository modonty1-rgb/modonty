import { Skeleton } from "@/components/ui/skeleton";

export default function ReelsApprovalLoading() {
  return (
    <div className="mx-auto max-w-[880px] space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-3 w-72" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-4 rounded-xl border bg-card p-4">
          <Skeleton className="aspect-[9/16] w-[150px] shrink-0 rounded-lg" />
          <div className="flex-1 space-y-3 py-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}
