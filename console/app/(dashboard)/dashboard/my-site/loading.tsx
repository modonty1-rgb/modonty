import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the page: header + link + hint, then the three cards (template · sections · colour). */
export default function MySiteLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
      <Skeleton className="h-44 w-full rounded-lg" />
      <Skeleton className="h-96 w-full rounded-lg" />
      <Skeleton className="h-36 w-full rounded-lg" />
    </div>
  );
}
