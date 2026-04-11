import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

export default function TagsLoading() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الوسوم" },
        ]}
      />

      <div className="border-b bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto max-w-[1128px] px-4 py-10">
          <Skeleton className="h-9 w-32 mb-3" />
          <Skeleton className="h-5 w-96 mb-3" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="container mx-auto max-w-[1128px] px-4 py-8">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-9 rounded-full"
              style={{ width: `${60 + (i % 4) * 20}px` }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
