import { Award, Building2, CalendarDays } from "lucide-react";

import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/**
 * «تعرّف علينا» — text first: the story in a comfortable measure, and beside it a quiet
 * facts card (founded · legal entity · credentials count) that gives the eye a second
 * anchor without repeating the logo the hero already showed. Content section pattern.
 */
export function ImageTextAbout({ data }: { data: HomeData; preview?: boolean }) {
  const facts = [
    data.hero.foundingYear ? { Icon: CalendarDays, label: "التأسيس", value: data.hero.foundingYear } : null,
    data.about.legalName ? { Icon: Building2, label: "الكيان", value: data.about.legalName } : null,
    data.trust.credentials.length > 0 ? { Icon: Award, label: "الاعتمادات", value: data.trust.credentials.map((c) => c.name).slice(0, 3).join(" · ") } : null,
  ].filter((f): f is NonNullable<typeof f> => f !== null);

  return (
    <Section id="about" eyebrow="تعرّف علينا" heading={data.name}>
      <div className="grid gap-10 md:grid-cols-[3fr_2fr] md:items-start">
        <p className="max-w-prose whitespace-pre-line text-base leading-8 text-foreground/90">{data.about.description}</p>
        {facts.length > 0 && (
          <dl className="grid gap-4 rounded-lg bg-muted/40 p-6 ring-1 ring-border">
            {facts.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[hsl(var(--primary-ink,var(--primary)))]">
                  <f.Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="text-sm font-medium text-foreground">{f.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}
      </div>
    </Section>
  );
}
