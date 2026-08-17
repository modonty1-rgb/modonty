import { Skeleton } from "@/components/ui/skeleton";

/** Below-the-hero placeholder while the home blocks stream: three sections' worth of height. */
export function PartnerHomeSkeleton() {
  return (
    <div className="mx-auto max-w-[1216px] space-y-20 px-4 pt-16" aria-hidden>
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-64" />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-64" />
        <Skeleton className="mt-8 h-60 rounded-2xl" />
      </div>
    </div>
  );
}
