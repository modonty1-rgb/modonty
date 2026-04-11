import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

export default function TagLoading() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الوسوم", href: "/tags" },
          { label: "..." },
        ]}
      />

      <div className="border-b bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto max-w-[1128px] px-4 py-10">
          <Skeleton className="h-9 w-48 mb-3" />
          <Skeleton className="h-5 w-80 mb-3" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="container mx-auto max-w-[1128px] px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
