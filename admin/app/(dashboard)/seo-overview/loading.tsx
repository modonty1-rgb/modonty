import { Skeleton } from "@/components/ui/skeleton";

export default function SeoOverviewLoading() {
  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-3.5 w-80 mt-1.5" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24 mt-2" />
          </div>
        ))}
      </div>

      {/* Tables */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-lg border mb-6">
          <div className="p-4 border-b">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-64 mt-1.5" />
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: i === 0 ? 7 : 6 }).map((_, j) => (
              <Skeleton key={j} className="h-10 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
