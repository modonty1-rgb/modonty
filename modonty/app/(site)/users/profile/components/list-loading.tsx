import { Skeleton } from "@/components/ui/skeleton";

/** The list tabs' skeleton (liked · disliked · favorites): four card-height rows. */
export function ListLoading() {
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}
