import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-md">
      <Skeleton className="w-full rounded-none" style={{ aspectRatio: "16/10" }} />
      <div className="p-4">
        <Skeleton className="mb-3 h-5 w-3/4" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
