import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ClientCardLoading() {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-6 w-16" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Skeleton className="h-12 w-full" />
        
        <div className="grid grid-cols-2 gap-3 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  );
}
