import { ChevronDown } from "lucide-react";

import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/** «الأسئلة الشائعة» — native <details> accordion (Shopify `collapsible-content`): no client JS, works everywhere. */
export function FaqAccordion({ data }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="faq" eyebrow="قبل ما تسأل" heading="الأسئلة الشائعة">
      <div className="mx-auto max-w-3xl divide-y rounded-lg ring-1 ring-border">
        {data.faqs.slice(0, 6).map((f) => (
          <details key={f.question} className="group px-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-medium text-foreground [&::-webkit-details-marker]:hidden">
              {f.question}
              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="pb-5 text-sm leading-7 text-muted-foreground">{f.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
