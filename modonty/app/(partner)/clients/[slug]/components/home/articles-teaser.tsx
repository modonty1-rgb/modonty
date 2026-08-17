import Link from "next/link";
import { OptimizedImage, type ImageMedia } from "@modonty/shared/components/optimized-image";
import { SectionHeading } from "./section-heading";

export interface TeaserArticle {
  id: string;
  slug: string;
  title: string;
  image: ImageMedia | null;
  category: string | null;
  datePublished: Date | null;
}

interface ArticlesTeaserProps {
  articles: TeaserArticle[];
  totalCount: number;
  base: string;
}

const DATE_FMT = new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "long", year: "numeric" });

/** «من قلمه» — the three newest articles the partner published on modonty. */
export function ArticlesTeaser({ articles, totalCount, base }: ArticlesTeaserProps) {
  const items = articles.slice(0, 3);
  if (items.length === 0) return null;
  const cols = items.length >= 3 ? "md:grid-cols-3" : items.length === 2 ? "md:grid-cols-2" : "";

  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1216px] px-4 py-16">
        <SectionHeading eyebrow="من قلمه" title={`يكتب من خبرته — ${totalCount.toLocaleString("ar-SA")} مقالاً على مدونتي`} more={{ href: `${base}/articles`, label: "كل المقالات" }} />
        <div className={`mt-8 grid gap-6 ${cols}`}>
          {items.map((a) => (
            <article key={a.id} className="group">
              <Link href={`/articles/${encodeURIComponent(a.slug)}`} className="block">
                <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-muted">
                  {a.image ? (
                    <OptimizedImage media={a.image} alt="" fill loading="lazy" sizes="card" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
                  ) : null}
                </div>
                <p className="mt-4 text-xs text-primary">
                  {a.category}
                  {a.datePublished ? <span className="text-muted-foreground"> · {DATE_FMT.format(a.datePublished)}</span> : null}
                </p>
                <h3 className="mt-1 text-lg font-bold leading-snug text-foreground group-hover:text-primary">{a.title}</h3>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
