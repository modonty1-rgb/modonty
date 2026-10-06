import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";
import { Stars } from "./parts/stars";

/**
 * Arabic number agreement — «رأي معتمَدة» and «من ٢ آراء» were both wrong (4 Oct 2026).
 * 1 → singular · 2 → dual · 3–10 → plural (non-human plural takes a feminine adjective) ·
 * 11+ → accusative singular.
 */
function countLine(n: number, fmt: Intl.NumberFormat): string {
  if (n === 1) return "من رأي واحد معتمَد";
  if (n === 2) return "من رأيين معتمَدين";
  if (n <= 10) return `من ${fmt.format(n)} آراء معتمَدة`;
  return `من ${fmt.format(n)} رأياً معتمَداً`;
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
    <Section id="reviews" eyebrow="تجارب مَن سبقك" heading="كل الآراء">
      <div className="mb-8 flex flex-wrap items-center gap-6 rounded-[var(--ps-radius-card,0.5rem)] p-6 ring-1 ring-border">
        <span className="text-5xl font-bold tabular-nums text-foreground">{fmt.format(avg)}</span>
        <div>
          <Stars n={avg} size="h-5 w-5" />
          <p className="mt-1 text-sm text-muted-foreground">{countLine(list.length, fmt)}</p>
        </div>
      </div>
      <ul className="grid gap-6 md:grid-cols-2">
        {list.map((t, i) => (
          <li key={i} className="flex flex-col rounded-[var(--ps-radius-card,0.5rem)] p-6 ring-1 ring-border">
            <Stars n={t.rating} />
            <blockquote className="mt-4 flex-1 text-sm leading-7 text-foreground">«{t.comment}»</blockquote>
            <p className="mt-4 text-sm font-medium text-muted-foreground">— {t.author}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
