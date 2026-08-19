import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { messages } from "@/lib/i18n/messages";

const text = messages.shop;

/**
 * Same breadcrumb, same container, same three-column grid and the same 306px card height as
 * the real page (measured 2026-08-19) — so nothing jumps when the partners land.
 */
export default function ShopLoading() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: text.breadcrumbLabel },
        ]}
      />

      <div className="container mx-auto max-w-[1128px] px-4 py-6">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-4 w-32" />
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[306px] w-full rounded-lg" />
          ))}
        </div>

        <Skeleton className="mt-8 h-[95px] w-full rounded-lg" />
      </div>
    </>
  );
}
