import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TrendingLoading() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الرائجة" },
        ]}
      />

      <main className="container mx-auto max-w-[1128px] px-4 py-8 flex-1">
        {/* Page Title Skeleton */}
        <Skeleton className="h-9 w-48 mb-2" />
        
        {/* Description Skeleton */}
        <Skeleton className="h-5 w-72 mb-4" />

        {/* Time Period Filter Skeleton */}
        <div className="flex gap-2 items-center mb-6">
          <Skeleton className="h-4 w-4" />
          <div className="flex border rounded-lg overflow-hidden">
            <Skeleton className="h-8 w-20 rounded-none" />
            <Skeleton className="h-8 w-20 rounded-none" />
            <Skeleton className="h-8 w-20 rounded-none" />
          </div>
        </div>

        {/* Trending Articles Grid Skeleton */}
        <section className="my-8 md:my-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <TrendingArticleSkeleton key={index} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function TrendingArticleSkeleton() {
  return (
    <Card className="h-full relative overflow-hidden">
      {/* Trending Badge Skeleton */}
      <div className="absolute top-2 right-2 z-10">
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>

      {/* Featured Image Skeleton */}
      <Skeleton className="aspect-video w-full" />

      <CardHeader className="pb-3">
        {/* Client and Category Skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Title Skeleton */}
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-3/4" />

        {/* Excerpt Skeleton */}
        <div className="mt-2 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardHeader>

      <CardContent>
        {/* Interaction Icons Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
