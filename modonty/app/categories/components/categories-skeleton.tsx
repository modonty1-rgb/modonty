import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoriesSkeletonProps {
  count?: number;
  variant?: 'grid' | 'list';
}

export function CategoriesSkeleton({ count = 4, variant = 'grid' }: CategoriesSkeletonProps) {
  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="border">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="w-32 h-32 shrink-0 rounded-lg" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <Skeleton className="h-5 w-12 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-8 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-8 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
