import { Star } from "lucide-react";

import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${n} من 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={i < n ? "h-4 w-4 fill-amber-400 text-amber-400" : "h-4 w-4 text-muted-foreground/40"} aria-hidden />
      ))}
    </span>
  );
}

/** «آراء العملاء» — three quote cards (Tailwind "testimonials grid"): stars, the words, the name. */
export function TestimonialsGrid({ data }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="reviews" eyebrow="تجارب مَن سبقك" heading="آراء العملاء">
      <ul className="grid gap-6 md:grid-cols-3">
        {data.testimonials.slice(0, 3).map((t, i) => (
          <li key={i} className="flex flex-col rounded-lg bg-background p-6 ring-1 ring-border">
            <Stars n={t.rating} />
            <blockquote className="mt-4 flex-1 text-sm leading-7 text-foreground">“{t.comment}”</blockquote>
            <p className="mt-4 text-sm font-medium text-muted-foreground">— {t.author}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
