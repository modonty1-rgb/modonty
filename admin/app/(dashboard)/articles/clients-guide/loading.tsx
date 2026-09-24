import { Skeleton } from "@/components/ui/skeleton";

/** Its own skeleton — without it this page inherits the «All Articles» one from `/articles/loading.tsx`. */
export default function ClientsGuideLoading() {
  return (
    <div className="space-y-3 px-4 pb-6 sm:px-5" aria-hidden>
      <div className="flex items-baseline justify-between gap-2 pt-1">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-3.5 w-52" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
      <div className="overflow-hidden rounded-lg border bg-card">
        <Skeleton className="h-10 w-full rounded-none" />
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex h-10 items-center gap-4 border-t px-2.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="ms-auto h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
