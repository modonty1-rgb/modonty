import { Skeleton } from "@/components/ui/skeleton";

export default function SystemErrorsLoading() {
  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-5 w-5 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
      <div className="rounded-md border divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
