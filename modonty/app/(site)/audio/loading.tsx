import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { messages } from "@/lib/i18n/messages";

/**
 * The page's own shape since the Quran moved to `/quran` (26 Sep 2026): breadcrumb, then one
 * `max-w-3xl` column — the heading, the intro line, the sticky player bar and the article rows.
 */
export default function AudioLoading() {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: messages.audio.breadcrumbLabel },
        ]}
      />
      <div className="container mx-auto max-w-[1128px] px-3 py-3 sm:px-4 sm:py-6" aria-hidden>
        <div className="mx-auto max-w-3xl space-y-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-6 h-20 w-full rounded-xl" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
