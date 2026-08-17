import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-md">
      <Skeleton className="w-full rounded-none" style={{ aspectRatio: "16/10" }} />
      <div className="p-4">
        <Skeleton className="mb-3 h-5 w-3/4" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function TagsLoading() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الوسوم" },
        ]}
      />

      {/* Hero skeleton — matches the full-bleed image hero (text bottom-anchored) */}
      <div className="border-b bg-zinc-950">
        <div className="container mx-auto flex min-h-[340px] max-w-[1128px] flex-col justify-end px-4 py-14 sm:min-h-[400px]">
          <Skeleton className="mb-5 h-7 w-48 rounded-full bg-white/10" />
          <Skeleton className="mb-3 h-11 w-80 max-w-full bg-white/10" />
          <Skeleton className="mb-4 h-11 w-64 max-w-full bg-white/10" />
          <Skeleton className="h-5 w-96 max-w-full bg-white/10" />
        </div>
      </div>

      {/* Toolbar + Grid skeleton */}
      <div className="container mx-auto max-w-[1128px] flex-1 px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-40 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}
