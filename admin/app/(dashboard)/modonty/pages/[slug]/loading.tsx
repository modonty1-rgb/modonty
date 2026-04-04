import { Skeleton } from "@/components/ui/skeleton";

export default function ModontyPageLoading() {
  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      {/* Header: title + buttons */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-3.5 w-56 mt-1.5" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Content card */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-[300px] w-full rounded-md" />
          </div>
          {/* SEO card */}
          <div className="rounded-lg border border-blue-500/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Image card */}
          <div className="rounded-lg border border-violet-500/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
          {/* Actions card */}
          <div className="rounded-lg border border-emerald-500/20 p-4">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
