import Link from "next/link";

import { ModontyCard } from "@/components/shared/modonty-card/ModontyCard";
import { cn } from "@/lib/utils";

import { withArchiveChange, type ArchiveState } from "../../helpers/build-archive-href";

import type { FilterOption } from "../../data/get-articles-filters";
import type { FeedPost } from "@/lib/types";

interface DiscoverRailProps {
  /** Modonty's own articles — see below for why this is not a most-read list. */
  modontyArticles: FeedPost[];
  brandLogoUrl: string | null;
  tags: FilterOption[];
  current: ArchiveState;
}

/** How many tags before the rail turns into a wall of words. */
const MAX_TAGS = 12;

/**
 * The left column, for the visitor who has no specific question — the one the filters on the right
 * cannot help, because he does not yet know what to filter by.
 *
 * It used to open with «الأكثر قراءة» ranked by views. Khalid killed that on sight (2026-08-19):
 * «حضر عميل على حساب عميل». The measurement backed him — كيما زون held two of the top five and
 * the top slot, so a rail fixed on every archive page would have been modonty promoting one paying
 * partner over another in its own voice. Modonty's own card carries the same weight and belongs
 * to nobody but us.
 */
export function DiscoverRail({ modontyArticles, brandLogoUrl, tags, current }: DiscoverRailProps) {
  return (
    <div className="space-y-3">
      <ModontyCard articles={modontyArticles} brandLogoUrl={brandLogoUrl} />

      {tags.length > 0 && (
        <nav aria-label="تصفية بالوسم" className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-foreground">الوسوم</h2>
            {current.tag && (
              <Link
                href={withArchiveChange(current, { tag: undefined })}
                className="text-xs font-medium text-link hover:underline"
              >
                امسح
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, MAX_TAGS).map((tag) => {
              const active = current.tag === tag.slug;
              return (
                <Link
                  key={tag.slug}
                  href={withArchiveChange(current, { tag: active ? undefined : tag.slug })}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs transition-colors",
                    active
                      ? "border-primary bg-primary/15 font-medium text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tag.name}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <section className="rounded-xl border border-border bg-card p-3">
        <h2 className="mb-1 text-sm font-bold text-foreground">ما لقيت جوابك؟</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          اسأل مودو — يجاوبك من محتوى مدونتي، وإذا ما لقى يوصّلك بالشريك المختصّ.
        </p>
        <Link
          href="/modo-chat"
          className="mt-2 inline-block text-xs font-medium text-link hover:underline"
        >
          افتح مودو ←
        </Link>
      </section>
    </div>
  );
}
