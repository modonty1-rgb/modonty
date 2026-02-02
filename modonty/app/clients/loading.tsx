import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientCardLoading } from "./components/client-card-loading";

export default function ClientsLoading() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "العملاء" },
        ]}
      />

      <section className="bg-gradient-to-b from-primary/5 to-background py-12 border-b">
        <div className="container mx-auto max-w-[1128px] px-4">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-48 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
            <div className="flex items-center justify-center gap-8 pt-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-10 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-[1128px] px-4 py-8 flex-1">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <Skeleton className="h-96 w-full" />
          </aside>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ClientCardLoading key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
