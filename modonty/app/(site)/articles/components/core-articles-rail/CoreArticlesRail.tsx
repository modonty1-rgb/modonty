import Link from "next/link";

import { buildArchiveHref } from "@/lib/articles/archive/build-archive-href";
import { BRAND_ICON_URL } from "@modonty/shared/lib/brand-assets";

export function CoreArticlesRail() {
  return (
    <Link
      href={buildArchiveHref({ modonty: true })}
      className="group flex min-h-32 flex-col items-center justify-center rounded-lg bg-card px-4 py-4 text-center ring-1 ring-primary/10 transition-colors hover:bg-muted hover:ring-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="mb-2 grid size-10 place-items-center rounded-full bg-primary/[.08] text-link transition-transform group-hover:scale-105">
        <img src={BRAND_ICON_URL} alt="" className="size-8" />
      </span>
      <span className="text-sm font-bold text-foreground">مقالات مدونتي</span>
      <span className="mt-1 text-xs font-medium text-link">عرض كل المقالات</span>
    </Link>
  );
}
