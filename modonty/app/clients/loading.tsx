import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientCardLoading } from "./components/client-card-loading";

// Mirrors the real /clients layout exactly to avoid layout shift on load:
// full-bleed featured slider → industry chips → search → toolbar → sidebar + grid → CTA banner.
export default function ClientsLoading() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الشركاء" },
        ]}
      />

      {/* Hero — full-bleed featured-partners slider (dark band, 6:1) */}
      <section aria-label="الشركاء المميّزون" className="relative w-full overflow-hidden bg-foreground">
        <div className="relative aspect-[6/1] min-h-[170px] w-full">
          {/* caption placeholder — logo + name, anchored bottom-start like the real slide */}
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto flex max-w-[1128px] items-end gap-3.5 px-4 pb-4 sm:pb-5">
              <div className="h-14 w-14 flex-shrink-0 animate-pulse rounded-2xl bg-white/15 sm:h-16 sm:w-16" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-40 animate-pulse rounded bg-white/15" />
                <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry chips bar */}
      <div className="py-6 border-b">
        <div className="container mx-auto max-w-[1128px] px-4">
          <Skeleton className="mb-3 h-4 w-32" />
          <div className="flex items-center gap-2 overflow-hidden pb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 flex-shrink-0 rounded-md" />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-[1128px] px-4 py-8 flex-1">
        {/* Search bar */}
        <Skeleton className="mb-6 h-11 w-full rounded-xl" />

        {/* Toolbar — count + sort/view */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>

        {/* Sidebar + cards grid */}
        <div className="flex gap-6">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <Skeleton className="h-96 w-full rounded-xl" />
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

      {/* Bottom CTA banner — «عملاء بلا إعلانات» */}
      <section className="container mx-auto max-w-[1128px] px-4 py-12 mt-4">
        <div className="rounded-2xl bg-primary/10 px-8 py-12 text-center">
          <Skeleton className="mx-auto h-8 w-3/4 max-w-md" />
          <Skeleton className="mx-auto mt-3 h-5 w-2/3 max-w-sm" />
          <Skeleton className="mx-auto mt-8 h-11 w-44 rounded-full" />
        </div>
      </section>
    </>
  );
}
