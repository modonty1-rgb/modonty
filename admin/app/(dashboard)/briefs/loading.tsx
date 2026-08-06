import { Skeleton } from "@/components/ui/skeleton";

export default function BriefsLoading() {
  return (
    <div className="mx-auto max-w-[1080px] space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-80" />
      </div>
      <Skeleton className="h-9 w-[260px]" />
      <div className="rounded-xl border bg-card p-3 space-y-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    </div>
  );
}
