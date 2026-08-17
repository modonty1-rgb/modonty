import { Skeleton } from "@/components/ui/skeleton";
import { ModontyGallerySkeleton } from "@/app/modonty/components/gallery/ModontyGallery";

export default function ModontyLoading() {
  return (
    <div className="container mx-auto max-w-[1128px] space-y-6 px-3 py-3 sm:px-4 sm:py-6">
      <div>
        <Skeleton className="aspect-[6/1] w-full rounded-lg" />
        <div className="-mt-10 flex items-end gap-4 px-5 sm:px-6">
          <Skeleton className="size-20 shrink-0 rounded-full ring-4 ring-background" />
          <Skeleton className="mb-2 h-7 w-40" />
        </div>
        <div className="mt-4 space-y-3 px-5 sm:px-6">
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col items-start gap-6 lg:flex-row lg:justify-center min-[1240px]:gap-4 min-[1296px]:gap-6">
        {/* Right rail: story · legal · team. */}
        <div className="hidden w-[300px] shrink-0 space-y-2 min-[1240px]:block">
          <Skeleton className="h-[380px] w-full rounded-lg" />
          <Skeleton className="h-[211px] w-full rounded-lg" />
          <Skeleton className="h-[60px] w-full rounded-lg" />
        </div>

        <div className="mx-auto w-full space-y-6 lg:mx-0 lg:flex-1 min-[1240px]:max-w-[560px] min-[1296px]:max-w-[600px]">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>

        {/* Left rail: the reels card (three portrait tiles), then the pinboard. */}
        <div className="hidden w-[300px] shrink-0 space-y-2 min-[1240px]:block">
          <Skeleton className="h-[140px] w-full rounded-lg" />
          <ModontyGallerySkeleton />
        </div>
      </div>
    </div>
  );
}
