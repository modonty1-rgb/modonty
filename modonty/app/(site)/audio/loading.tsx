import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { messages } from "@/lib/i18n/messages";

/**
 * The page's own shape: breadcrumb, then `ResizableTwoColumnLayout` — same container
 * (`max-w-[1128px] px-3 py-3 sm:px-4 sm:py-6`), the recitation at 73% and the articles
 * rail at 27% from 1240px, stacked below it.
 *
 * Until 24 Sep 2026 it drew one heading in a `max-w-3xl` box — the page had grown two
 * columns and a surah grid since, so the footer painted where the player was about to land.
 */
export default function AudioLoading() {
  return (
    <div className="pt-[var(--sticky-chrome)] lg:pt-0">
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: messages.audio.breadcrumbLabel },
        ]}
      />
      <div className="container mx-auto max-w-[1128px] px-3 py-3 sm:px-4 sm:py-6" aria-hidden>
        <div className="mb-6">
          <Skeleton className="mt-2 h-4 w-3/4 max-md:hidden" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col gap-6 min-[1240px]:flex-row min-[1240px]:gap-0">
          <div className="w-full min-w-0 space-y-4 min-[1240px]:w-[73%] min-[1240px]:pe-3">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-[92px] rounded-xl" />
              ))}
            </div>
          </div>
          <div className="hidden w-[27%] space-y-3 border-s ps-3 min-[1240px]:block">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-[72px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
