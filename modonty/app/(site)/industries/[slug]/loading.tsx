import { Skeleton } from "@/components/ui/skeleton";

/** Same three columns, same widths, same card heights as the real page — nothing moves when it lands. */
export default function IndustryLoading() {
  return (
    <div className="container mx-auto max-w-[1128px] px-3 py-3 sm:px-4 sm:py-6">
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:justify-center min-[1240px]:gap-4 min-[1296px]:gap-6">
        <div className="hidden w-[300px] shrink-0 space-y-2 min-[1240px]:block" aria-hidden>
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </div>

        <div className="mx-auto w-full space-y-4 pb-20 md:max-w-[600px] lg:pb-0 lg:mx-0 lg:flex-1 min-[1240px]:max-w-[560px] min-[1296px]:max-w-[600px]">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[160px] w-full rounded-lg" />
          ))}
        </div>

        <div className="hidden w-[300px] shrink-0 space-y-4 lg:block" aria-hidden>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-[220px] w-full rounded-lg" />
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
