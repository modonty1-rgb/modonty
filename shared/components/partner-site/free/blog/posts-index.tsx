import { SiteLink } from "../../parts/site-link";
import { PostCover } from "./parts/post-cover";
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
    <Section id="blog" eyebrow="من خبرتنا" heading="كل المقالات">
      <SiteLink href={first.href} className="group grid gap-6 rounded-[var(--ps-radius-card,0.5rem)] ring-1 ring-border md:grid-cols-2">
        <PostCover post={first} data={data} sizes="(max-width: 768px) 100vw, 560px" className="relative block aspect-[5/3] overflow-hidden rounded-s-lg md:aspect-auto md:min-h-[280px]" />
        <span className="flex flex-col justify-center p-6">
          <span className="text-sm text-muted-foreground md:text-xs">{[first.category, first.date].filter(Boolean).join(" · ")}</span>
          <span className="mt-2 text-2xl font-bold leading-tight text-foreground">{first.title}</span>
          {first.excerpt && <span className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">{first.excerpt}</span>}
          <span className="mt-4 text-sm font-medium text-[hsl(var(--primary-ink,var(--primary)))]">اقرأ المقال</span>
        </span>
      </SiteLink>
      {rest.length > 0 && (
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {rest.map((p) => (
            <li key={p.href}>
              <SiteLink href={p.href} className="group block">
                <PostCover post={p} data={data} sizes="card" className="relative block aspect-[5/3] overflow-hidden rounded-[var(--ps-radius-card,0.5rem)]" />
                <span className="mt-3 block text-sm text-muted-foreground md:text-xs">{[p.category, p.date].filter(Boolean).join(" · ")}</span>
                <span className="mt-1 line-clamp-2 block text-pretty text-base font-bold leading-6 text-foreground">{p.title}</span>
                {p.excerpt && <span className="mt-1 line-clamp-2 block text-sm leading-6 text-muted-foreground">{p.excerpt}</span>}
              </SiteLink>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
