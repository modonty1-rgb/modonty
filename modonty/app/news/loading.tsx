import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";

export default function NewsLoading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "أخبار مودونتي" },
        ]}
      />
      <div className="mt-8 animate-pulse space-y-10">
        <div className="text-center">
          <div className="inline-block h-14 w-14 rounded-2xl bg-muted mb-4" />
          <div className="h-9 bg-muted rounded w-48 mx-auto mb-3" />
          <div className="h-5 bg-muted rounded w-72 mx-auto" />
        </div>
        <div className="h-40 rounded-2xl bg-muted" />
        <div>
          <div className="h-4 bg-muted rounded w-24 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-muted rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
