import { Skeleton } from "@/components/ui/skeleton";

export default function SubscribersLoading() {
  return (
    <div className="container mx-auto max-w-[1128px]">
      <div className="mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-1" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
