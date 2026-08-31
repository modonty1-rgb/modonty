import { Briefcase } from "lucide-react";

import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/** «خدماتنا» — three-up cards (Tailwind "feature section" / Shopify `multicolumn`): icon, title, one line. */
export function ServicesGrid({ data }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="services" eyebrow="ماذا نقدّم" heading="خدماتنا" tone="muted">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.services.slice(0, 6).map((s) => (
          <li key={s.title} className="group rounded-lg bg-background p-6 ring-1 ring-border transition-shadow hover:ring-2 hover:ring-primary/40">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-[hsl(var(--primary-ink,var(--primary)))]">
              <Briefcase className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-bold text-foreground">{s.title}</h3>
            {s.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{s.description}</p>}
          </li>
        ))}
      </ul>
    </Section>
  );
}
