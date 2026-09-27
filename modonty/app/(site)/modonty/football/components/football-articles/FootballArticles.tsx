import Image from "next/image";
import Link from "next/link";

import { messages } from "@/lib/i18n/messages";

import type { FootballArticle } from "../../data/get-football-articles";

const t = messages.modonty.football;

/** Modonty's own football articles. Absent entirely when there are none — no empty card. */
export function FootballArticles({ articles }: { articles: FootballArticle[] }) {
  if (!articles.length) return null;
  return (
    <section aria-labelledby="football-articles" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="football-articles" className="text-lg font-bold">
        {t.articlesTitle}
      </h2>
      <ul className="mt-2 divide-y divide-border">
        {articles.map((a) => (
          <li key={a.id}>
            <Link href={`/articles/${a.slug}`} className="flex items-center gap-3 py-2.5 hover:text-link">
              {a.image ? (
                <Image src={a.image} alt="" width={84} height={56} className="h-14 w-[84px] shrink-0 rounded-md object-cover" />
              ) : (
                <span className="h-14 w-[84px] shrink-0 rounded-md bg-muted" />
              )}
              <span className="line-clamp-2 text-sm font-medium leading-snug">{a.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
