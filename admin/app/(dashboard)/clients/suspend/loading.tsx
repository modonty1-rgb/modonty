import { Skeleton } from "@/components/ui/skeleton";

export default function SuspendClientLoading() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border bg-card px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
