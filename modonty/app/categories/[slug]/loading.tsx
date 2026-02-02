import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleSkeleton } from "./components/article-skeleton";

export default function CategoryDetailLoading() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الفئات", href: "/categories" },
          { label: "..." },
        ]}
      />

      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto max-w-[1128px] px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Skeleton className="w-full md:w-48 aspect-video md:aspect-square rounded-xl" />

            <div className="flex-1">
              <Skeleton className="h-12 w-64 mb-4" />
              <Skeleton className="h-6 w-full max-w-3xl mb-2" />
              <Skeleton className="h-6 w-5/6 max-w-3xl mb-6" />
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-8 w-12 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-8 w-12 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-8 w-12 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-[1128px] px-4 py-8 flex-1">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <ArticleSkeleton count={6} />
      </div>

    </>
  );
}
