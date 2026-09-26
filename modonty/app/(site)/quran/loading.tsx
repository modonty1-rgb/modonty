import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { messages } from "@/lib/i18n/messages";

/**
 * The page's own shape (26 Sep 2026): breadcrumb · title (desktop) · the one provenance line ·
 * reciter and search on one row from `md` (stacked on phones) · the surah cards, three columns
 * from ~1000px, 62px tall.
 */
export default function QuranLoading() {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: messages.quran.breadcrumbLabel },
        ]}
      />
      <div className="container mx-auto max-w-[1128px] px-3 pb-6 pt-2 sm:px-4" aria-hidden>
        <Skeleton className="mb-2 h-8 w-40 max-md:hidden" />
        <Skeleton className="mb-4 h-4 w-3/4 max-md:mb-3" />
        <div className="flex flex-col gap-3 md:flex-row">
          <Skeleton className="h-11 w-full rounded-xl md:w-80" />
          <Skeleton className="h-11 w-full flex-1 rounded-xl" />
        </div>
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-[62px] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
