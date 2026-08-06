import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the page: header, upload box, then the 9:16 masonry of cards. */
export default function VideosLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>

      <Skeleton className="h-28 w-full rounded-lg" />

      <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="mb-4 aspect-[9/16] w-full break-inside-avoid rounded-lg" />
        ))}
      </div>
    </div>
  );
}
