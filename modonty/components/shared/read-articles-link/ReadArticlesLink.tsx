import Link from "next/link";

import { IconArticle, IconChevronLeft } from "@/lib/icons";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

interface ReadArticlesLinkProps {
  /** What the visitor is looking at, in his words: a category name or a tag name. */
  label: string;
  /** Where the archive should land — already built by the caller. */
  href: string;
  count: number;
}

/**
 * The way out of a page that answers the wrong question.
 *
 * `/categories/[slug]` and `/tags/[slug]` list PARTNERS — thirty-eight pages that end with a
 * visitor who came to read looking at a list of companies. This is the one line that hands him
 * the articles instead. It renders nothing when there are none, because a link to an empty page
 * costs more trust than a missing link.
 */
export function ReadArticlesLink({ label, href, count }: ReadArticlesLinkProps) {
  if (count <= 0) return null;

  return (
    <div className="container mx-auto max-w-[1128px] px-4 pt-6">
      <Link
        href={href}
        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
      >
        <span className="flex items-center gap-3">
          <IconArticle className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <span className="text-sm font-medium text-foreground">
            اقرأ {count.toLocaleString(SITE_LOCALE)} مقالاً في {label}
          </span>
        </span>
        <IconChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    </div>
  );
}
