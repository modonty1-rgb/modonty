import { Star } from "lucide-react";

import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

function Stars({ n, size = "h-4 w-4" }: { n: number; size?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${n} من 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={i < Math.round(n) ? `${size} fill-amber-400 text-amber-400` : `${size} text-muted-foreground/40`} aria-hidden />
      ))}
    </span>
  );
}

/**
 * «آراء العملاء — كلّها» — the reviews page pattern the marketplaces share (Google
 * Business · Trustpilot · Zocdoc): a summary first (average · count · stars), then every
 * approved review as a card. Reviews come from modonty visitors and the partner approves
 * them in the console — nothing to write here, only to show.
 */
export function ReviewsList({ data }: { data: HomeData; preview?: boolean }) {
  const list = data.testimonials;
  if (list.length === 0) return null;
  const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
  const fmt = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 1 });
  return (
    <Section id="reviews" eyebrow="تجارب مَن سبقك" heading={`آراء عملاء ${data.name}`}>
      <div className="mb-8 flex flex-wrap items-center gap-6 rounded-lg p-6 ring-1 ring-border">
        <span className="text-5xl font-bold tabular-nums text-foreground">{fmt.format(avg)}</span>
        <div>
          <Stars n={avg} size="h-5 w-5" />
          <p className="mt-1 text-sm text-muted-foreground">من {fmt.format(list.length)} {list.length === 1 ? "رأي" : list.length <= 10 ? "آراء" : "رأياً"} معتمَدة</p>
        </div>
      </div>
      <ul className="grid gap-6 md:grid-cols-2">
        {list.map((t, i) => (
          <li key={i} className="flex flex-col rounded-lg p-6 ring-1 ring-border">
            <Stars n={t.rating} />
            <blockquote className="mt-4 flex-1 text-sm leading-7 text-foreground">“{t.comment}”</blockquote>
            <p className="mt-4 text-sm font-medium text-muted-foreground">— {t.author}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
