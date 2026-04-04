import { Skeleton } from "@/components/ui/skeleton";

export default function TagViewLoading() {
  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-48 mt-1.5" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}
