import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoriesSkeleton } from "./components/categories-skeleton";

export default function CategoriesLoading() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الفئات" },
        ]}
      />

      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto max-w-[1128px] px-4 py-12 md:py-16">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          
          <div className="flex flex-wrap gap-6">
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
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-[1128px] px-4 py-8 flex-1">
        <div className="mb-12">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />
          <CategoriesSkeleton count={4} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        <CategoriesSkeleton count={6} />
      </div>

    </>
  );
}
