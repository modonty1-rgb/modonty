import { Skeleton } from "@/components/ui/skeleton";

export default function ModontyMediaLoading() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      <div>
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72 mt-1" />
      </div>
      <Skeleton className="h-9 w-[520px] max-w-full" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
