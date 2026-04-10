import { Skeleton } from "@/components/ui/skeleton";

export default function FollowingLoading() {
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <Skeleton className="h-5 w-40" />
        </div>
      ))}
    </div>
  );
}
