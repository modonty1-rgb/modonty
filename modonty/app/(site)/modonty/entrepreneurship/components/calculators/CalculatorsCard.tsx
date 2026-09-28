import { messages } from "@/lib/i18n/messages";

import { BreakEvenCalculator } from "./BreakEvenCalculator";
import { PriceCalculator } from "./PriceCalculator";

const t = messages.modonty.entrepreneurship.calc;

/** Two sums a new business owner does before opening: the shelf price with VAT, and the break-even. */
export function CalculatorsCard() {
  return (
    <section aria-labelledby="calculators" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="calculators" className="text-lg font-bold">
        {t.title}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t.note}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <PriceCalculator labels={t.price} currency={t.currency} />
        <BreakEvenCalculator labels={t.breakEven} currency={t.currency} />
      </div>
    </section>
  );
}
