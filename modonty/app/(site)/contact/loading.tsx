import { Skeleton } from "@/components/ui/skeleton";

/**
 * `/contact` as it draws: `max-w-2xl` · trail · title + intro · the details card (email, phone,
 * address) · the form card. Until 24 Sep 2026 it drew bare inputs with no trail and no details
 * card, so the form landed ~100px lower than its skeleton.
 */
export default function ContactLoading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8" aria-hidden>
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-4 h-4 w-3/4" />
      <div className="mt-6 space-y-3 rounded-lg border p-4">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="mt-6 space-y-4 rounded-lg border p-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-2/3" />
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
        <Skeleton className="h-28 w-full rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}
