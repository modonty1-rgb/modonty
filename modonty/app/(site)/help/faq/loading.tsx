import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * The FAQ page as it draws: trail · title + intro · the two outline buttons · search ·
 * ONE card holding the count line and the questions as divided rows (`FAQPageContent`).
 * Until 24 Sep 2026 it skipped the buttons and the search and drew six separate cards,
 * so the list started ~90px higher than the real one.
 */
export default function FaqLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8" aria-hidden>
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mb-6">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="flex gap-3 mb-6">
        <Skeleton className="h-9 w-44 rounded-md max-md:h-11" />
        <Skeleton className="h-9 w-24 rounded-md max-md:h-11" />
      </div>
      <Skeleton className="h-9 w-full rounded-md mb-6 max-md:h-11" />
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-5">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-6 w-32 shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
