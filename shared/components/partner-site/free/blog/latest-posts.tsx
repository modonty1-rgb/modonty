import { OptimizedImage, asMedia } from "../../../optimized-image";
import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/** «المدونة» — three latest posts as image cards (Shopify `featured-blog` / Tailwind "blog section"). */
export function LatestPosts({ data }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="blog" eyebrow="من خبرتنا" heading="المدونة" tone="muted">
      <ul className="grid gap-6 md:grid-cols-3">
        {data.posts.slice(0, 3).map((p) => (
          <li key={p.href}>
            <a href={p.href} className="group block">
              <span className="relative block aspect-[5/3] overflow-hidden rounded-lg bg-muted">
                {p.imageUrl && <OptimizedImage media={asMedia(p.imageUrl, p.title)} alt="" fill sizes="thumb" className="object-cover transition-transform group-hover:scale-[1.02]" />}
              </span>
              {p.date && <p className="mt-3 text-xs text-muted-foreground">{p.date}</p>}
              <h3 className="mt-1 line-clamp-2 text-base font-bold leading-6 text-foreground">{p.title}</h3>
            </a>
          </li>
        ))}
      </ul>
      {/* الرئيسية تعرض ثلاثة، والباقي في صفحة المقالات — لا قائمة كاملة داخل الرئيسية. */}
      {data.posts.length > 3 && (
        <a
          href={`${data.blogHref ?? "#"}`}
          className="mt-8 inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          كل المقالات
        </a>
      )}
    </Section>
  );
}
