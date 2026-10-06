import { ChevronDown } from "lucide-react";

import type { HomeData } from "../../home/home-data";

/**
 * The accordion both FAQ sections draw — they were two copies of the same markup (4 Oct 2026).
 * Answers keep the partner's own line breaks: a long answer typed in paragraphs was squeezed
 * into one block. `name` makes the page list one-open-at-a-time.
 */
export function FaqItems({ faqs, name }: { faqs: HomeData["faqs"]; name?: string }) {
  return (
    <div className="mx-auto max-w-3xl divide-y rounded-[var(--ps-radius-card,0.5rem)] ring-1 ring-border">
      {faqs.map((f) => (
        <details key={f.question} name={name} className="group px-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-medium text-foreground [&::-webkit-details-marker]:hidden">
            {f.question}
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground motion-safe:transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="whitespace-pre-line pb-5 text-sm leading-7 text-muted-foreground">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
