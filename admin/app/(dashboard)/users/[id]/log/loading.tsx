import { Skeleton } from "@/components/ui/skeleton";

export default function StaffLogLoading() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <div className="mb-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40 mt-1" />
      </div>

      <div className="flex gap-2 mb-4">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
