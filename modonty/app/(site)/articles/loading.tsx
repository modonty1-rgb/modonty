import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the real three columns, so nothing jumps when the data lands. */
export default function ArticlesLoading() {
  return (
    <div className="container mx-auto max-w-[1128px] px-3 py-3 sm:px-4 sm:py-6">
      <Skeleton className="mb-6 h-5 w-56" />
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:justify-center min-[1240px]:gap-4 min-[1296px]:gap-6">
        <div className="hidden w-[300px] shrink-0 space-y-3 min-[1240px]:block">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>

        <div className="mx-auto w-full space-y-4 md:max-w-[600px] lg:mx-0 lg:flex-1 min-[1240px]:max-w-[560px] min-[1296px]:max-w-[600px]">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>

        <div className="hidden w-[300px] shrink-0 space-y-3 min-[1240px]:block">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
