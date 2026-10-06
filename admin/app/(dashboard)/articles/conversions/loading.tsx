import { Skeleton } from "@/components/ui/skeleton";

/** Its own skeleton — without it this page inherits the «All Articles» one from `/articles/loading.tsx`. */
export default function ArticleConversionsLoading() {
  return (
    <div className="space-y-4 px-4 pb-6 sm:px-5" aria-hidden>
      <div className="flex items-end justify-between gap-3 pt-1">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <Skeleton className="h-7 w-64" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
