import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { PostCardSkeleton } from "@/components/PostCardSkeleton";

export default function SearchLoading() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "بحث" },
        ]}
      />
      <main className="container mx-auto max-w-[1128px] px-4 py-8 flex-1" dir="rtl">
        <section className="space-y-6">
          <div className="flex gap-2 max-w-md">
            <Skeleton className="h-12 flex-1 rounded-md" />
            <Skeleton className="h-12 w-20 rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PostCardSkeleton count={6} />
          </div>
        </section>
      </main>
    </>
  );
}
