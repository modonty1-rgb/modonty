import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HelpLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-9 w-48 mb-4" />
      <Skeleton className="h-5 w-96 mb-8" />
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
