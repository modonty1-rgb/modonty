import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";

export default function HelpLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-9 w-48 mb-6" />
      <Skeleton className="h-5 w-96 mb-8 max-md:w-full" />
      <div className="grid gap-6 md:grid-cols-2">
        {/* Three doors, title + one line each — `HelpLinks` has no button (it drew two cards
            with a button each until 24 Sep 2026). */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="h-full">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
