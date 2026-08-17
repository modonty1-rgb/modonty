import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function FaqLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-9 w-48 mb-4" />
      <Skeleton className="h-5 w-80 mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-5 shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
