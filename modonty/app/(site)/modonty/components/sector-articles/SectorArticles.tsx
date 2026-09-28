import Image from "next/image";
import Link from "next/link";

import { messages } from "@/lib/i18n/messages";

import type { SectorArticle } from "../../data/get-sector-articles";

const t = messages.modonty.sectorPage;

/** Columns that the picks fill exactly: 1 · 2 · 3 in a row, and four as two by two. */
const COLUMNS: Record<number, string> = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2" };

/**
 * A sector's own articles, picked in the admin — in the main column right after the first live
 * card, not at the foot of the rail (Khalid, 28 Sep 2026: the project is Modonty, yet its articles
 * had the smallest place). NN/g, «Scrolling and Attention» (2018): «74% of the viewing time was
 * spent in the first two screenfuls» — «Reserve the top of the page for … key business and user
 * goals»: the live data is the reader's goal, these articles are ours.
 *
 * Image, bold title, then our summary — the strong cues that stop an F-shaped skim (NN/g). A compact
 * row on a phone so four picks do not become a long scroll; from `sm` the image goes on top and the
 * columns follow the count — three picks in two columns left one card alone under an empty half
 * (measured 700px tall at 1280, 28 Sep 2026). Absent entirely when nothing is picked.
 */
export function SectorArticles({ articles }: { articles: SectorArticle[] }) {
  if (!articles.length) return null;
  return (
    <section aria-labelledby="sector-articles" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="sector-articles" className="text-lg font-bold">
        {t.articlesTitle}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t.articlesNote}</p>
      <ul className={`mt-3 grid gap-3 sm:gap-4 ${COLUMNS[articles.length] ?? "sm:grid-cols-2"}`}>
        {articles.map((a) => (
          <li key={a.id}>
            <Link
              href={`/articles/${a.slug}`}
              className="group flex gap-3 rounded-lg sm:flex-col sm:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted sm:aspect-video sm:h-auto sm:w-full">
                {a.image && <Image src={a.image} alt="" fill sizes="(min-width: 640px) 420px, 96px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />}
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-link">{a.title}</span>
                {a.summary && <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">{a.summary}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
