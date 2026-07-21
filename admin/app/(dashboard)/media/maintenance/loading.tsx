import { Skeleton } from "@/components/ui/skeleton";

export default function MediaMaintenanceLoading() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-1 h-4 w-72" />
      </div>
      <div className="flex gap-2.5">
        <Skeleton className="h-11 w-40" />
        <Skeleton className="h-11 w-48" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}
