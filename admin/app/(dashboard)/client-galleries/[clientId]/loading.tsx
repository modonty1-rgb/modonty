import { Skeleton } from "@/components/ui/skeleton";

export default function ClientGalleryLoading() {
  return (
    <div className="mx-auto max-w-[1080px] space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}
