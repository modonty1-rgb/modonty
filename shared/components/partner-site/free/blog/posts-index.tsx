import { OptimizedImage, asMedia } from "../../../optimized-image";
import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/**
 * «المدونة — كل المقالات» — the blog index the big platforms use (Shopify `main-blog`,
 * Tailwind "blog section with featured post"): the newest post large with its excerpt,
 * then a 3-column grid of the rest — image · category · date · title · excerpt.
 */
export function PostsIndex({ data }: { data: HomeData; preview?: boolean }) {
  const [first, ...rest] = data.posts;
  if (!first) return null;
  return (
    <Section id="blog" eyebrow="من خبرتنا" heading={`مدونة ${data.name}`}>
      <a href={first.href} className="group grid gap-6 rounded-lg ring-1 ring-border md:grid-cols-2">
        <span className="relative block aspect-[5/3] overflow-hidden rounded-s-lg bg-muted md:aspect-auto md:min-h-[280px]">
          {first.imageUrl && <OptimizedImage media={asMedia(first.imageUrl, first.title)} alt="" fill sizes="560px" className="object-cover transition-transform group-hover:scale-[1.02]" />}
        </span>
        <span className="flex flex-col justify-center p-6">
          <span className="text-xs text-muted-foreground">{[first.category, first.date].filter(Boolean).join(" · ")}</span>
          <span className="mt-2 text-2xl font-bold leading-tight text-foreground">{first.title}</span>
          {first.excerpt && <span className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">{first.excerpt}</span>}
          <span className="mt-4 text-sm font-medium text-[hsl(var(--primary-ink,var(--primary)))]">اقرأ المقال</span>
        </span>
      </a>
      {rest.length > 0 && (
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {rest.map((p) => (
            <li key={p.href}>
              <a href={p.href} className="group block">
                <span className="relative block aspect-[5/3] overflow-hidden rounded-lg bg-muted">
                  {p.imageUrl && <OptimizedImage media={asMedia(p.imageUrl, p.title)} alt="" fill sizes="thumb" className="object-cover transition-transform group-hover:scale-[1.02]" />}
                </span>
                <span className="mt-3 block text-xs text-muted-foreground">{[p.category, p.date].filter(Boolean).join(" · ")}</span>
                <span className="mt-1 line-clamp-2 block text-base font-bold leading-6 text-foreground">{p.title}</span>
                {p.excerpt && <span className="mt-1 line-clamp-2 block text-sm leading-6 text-muted-foreground">{p.excerpt}</span>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
