import { Section } from "../home/parts/section";
import { ViewAllLink } from "../home/parts/view-all-link";
import type { HomeData } from "../home/home-data";
import { Stars } from "./parts/stars";

/** «آراء العملاء» — three quote cards (Tailwind "testimonials grid"): stars, the words, the name. */
export function TestimonialsGrid({ data }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="reviews" eyebrow="تجارب مَن سبقك" heading="آراء العملاء">
      {/* Phones: a swipeable row (85% cards, snap) instead of three stacked cards — 802px on the
          home page (4 Oct 2026). Desktop keeps the three columns. */}
      <ul className="grid gap-6 md:grid-cols-3 max-md:-mx-6 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:gap-4 max-md:overflow-x-auto max-md:px-6 max-md:pb-2 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
        {data.testimonials.slice(0, 3).map((t, i) => (
          <li key={i} className="flex flex-col rounded-[var(--ps-radius-card,0.5rem)] bg-background p-6 ring-1 ring-border max-md:w-[85%] max-md:shrink-0 max-md:snap-start">
            <Stars n={t.rating} />
            <blockquote className="mt-4 flex-1 text-sm leading-7 text-foreground">«{t.comment}»</blockquote>
            <p className="mt-4 text-sm font-medium text-muted-foreground">— {t.author}</p>
          </li>
        ))}
      </ul>
      <ViewAllLink href={data.reviewsHref} label="كل الآراء" shown={Math.min(3, data.testimonials.length)} total={data.testimonials.length} />
    </Section>
  );
}
