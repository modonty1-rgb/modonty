import { SiteLink } from "../../parts/site-link";
import { PostCover } from "./parts/post-cover";
import { Section } from "../home/parts/section";
import { ViewAllLink } from "../home/parts/view-all-link";
import type { HomeData } from "../home/home-data";

/** «مقالاتنا» — three latest posts as image cards (Shopify `featured-blog` / Tailwind "blog section"). */
export function LatestPosts({ data }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="blog" eyebrow="من خبرتنا" heading="مقالاتنا" tone="muted">
      <ul className="grid gap-6 md:grid-cols-3">
        {data.posts.slice(0, 3).map((p) => (
          <li key={p.href}>
            {/* Phones: a 96px thumbnail beside the title — three full-width covers stacked measured
                1,164px, the tallest block on the home page (4 Oct 2026). Desktop unchanged. */}
            <SiteLink href={p.href} className="group block max-md:flex max-md:items-center max-md:gap-4">
              <PostCover post={p} data={data} sizes="(max-width: 767px) 96px, 360px" className="relative block aspect-[5/3] overflow-hidden rounded-[var(--ps-radius-card,0.5rem)] max-md:aspect-square max-md:w-24 max-md:shrink-0" />
              <div className="min-w-0">
                {p.date && <p className="mt-3 text-sm text-muted-foreground md:text-xs max-md:mt-0">{p.date}</p>}
                <h3 className="mt-1 line-clamp-2 text-pretty text-base font-bold leading-6 text-foreground">{p.title}</h3>
              </div>
            </SiteLink>
          </li>
        ))}
      </ul>
      {/* الرئيسية تعرض ثلاثة، والباقي في صفحة المقالات — لا قائمة كاملة داخل الرئيسية. */}
      <ViewAllLink href={data.blogHref} label="كل المقالات" shown={Math.min(3, data.posts.length)} total={data.posts.length} />
    </Section>
  );
}
