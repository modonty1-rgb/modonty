import Link from "next/link";

import { ModontyArrowMark } from "@/components/icons/modonty-arrow-mark";

interface FeedPaginationProps {
  page: number;
  hasMore: boolean;
  /** Built by the caller, which owns the rest of its query string (filters, tags, view). */
  buildHref: (page: number) => string;
  /** Names the nav for assistive tech — «تنقّل بين صفحات المقالات», «…الأسئلة», … */
  label?: string;
}

/**
 * Previous/next paging for any modonty feed.
 *
 * Promoted 22 Aug 2026 (Khalid: «احنا بانينها ومستخدمة في الأرتكل — ليش تفتي؟ استخدمها»).
 * He was right that it existed and wrong only about where: it was not a component at all,
 * it was the same `<nav>` copied into FIVE files — the homepage, `/articles`, `/industries`,
 * `/modonty` and the FAQ. Every fix had to be made five times, and they had already drifted
 * (three had a 44px tap target, two had none).
 *
 * Real `<a href>` links, never infinite scroll — Google reaches article eleven by following
 * a link, not by scrolling, and these pages exist to be crawled as much as read. The one
 * thing each caller keeps is `buildHref`, because only the caller knows what else lives in
 * its query string.
 *
 * `min-h-11` is the 44px target of WCAG 2.2 SC 2.5.5, not the 24px floor: this is the
 * control a reader hits with a thumb at the very bottom of a long page, where a miss means
 * scrolling back up.
 */
export function FeedPagination({ page, hasMore, buildHref, label = "تنقّل بين الصفحات" }: FeedPaginationProps) {
  if (page <= 1 && !hasMore) return null;

  const link =
    "inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-link transition-colors hover:underline active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <nav aria-label={label} className="flex items-center justify-between gap-3 border-t border-border pt-4">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className={link}>
          {/* The mark is one drawing pointing to the line's start, so «previous» flips it. */}
          <ModontyArrowMark className="size-5 rotate-180 text-muted-foreground" />
          الصفحة السابقة
        </Link>
      ) : (
        <span />
      )}
      {hasMore && (
        <Link href={buildHref(page + 1)} className={link}>
          الصفحة التالية
          <ModontyArrowMark className="size-5 text-muted-foreground" />
        </Link>
      )}
    </nav>
  );
}
