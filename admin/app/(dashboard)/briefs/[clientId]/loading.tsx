import { Skeleton } from "@/components/ui/skeleton";

export default function BriefDetailLoading() {
  return (
    <div className="mx-auto max-w-[1180px] space-y-5">
      <Skeleton className="h-8 w-32" />
      <div className="rounded-xl border bg-card p-4">
        <div className="flex gap-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-3 w-80" />
          </div>
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
