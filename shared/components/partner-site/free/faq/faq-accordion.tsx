import { ChevronDown } from "lucide-react";

import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/**
 * How many questions this accordion renders. Exported because the page that renders it also
 * declares an `FAQPage` to Google, and the two must describe the SAME set: Google's structured
 * data policy is "Don't mark up content that is not visible to readers of the page"
 * (developers.google.com/search/docs/appearance/structured-data/sd-policies). The partner home
 * page declared all thirty questions while showing six, so twenty questions and their answers
 * were promised to Google and absent from the HTML (measured 27 Aug 2026). The full set lives
 * on the partner's /faq page, which renders every question and ships its own FAQPage.
 */
export const HOME_FAQ_LIMIT = 6;

/** «الأسئلة الشائعة» — native <details> accordion (Shopify `collapsible-content`): no client JS, works everywhere. */
export function FaqAccordion({ data }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="faq" eyebrow="قبل ما تسأل" heading="الأسئلة الشائعة">
      <div className="mx-auto max-w-3xl divide-y rounded-lg ring-1 ring-border">
        {data.faqs.slice(0, HOME_FAQ_LIMIT).map((f) => (
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
