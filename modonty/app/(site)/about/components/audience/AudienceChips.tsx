import { messages } from "@/lib/i18n/messages";

const text = messages.about.audience;

/**
 * Named professions, not «رواد الأعمال» — modonty serves any Arab business owner, and a
 * doctor or a shop owner reading «entrepreneurs» in the hero would reasonably assume this
 * page is not for them. Plain pills, same shape `ServiceChips` uses on a partner card, so
 * a returning visitor reads this as «real categories», not decoration.
 */
export function AudienceChips() {
  return (
    <section aria-labelledby="audience-heading" className="space-y-3">
      <div>
        <h2 id="audience-heading" className="text-lg font-bold text-foreground">
          {text.sectionTitle}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{text.sectionSubtitle}</p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {text.chips.map((chip) => (
          <li key={chip} className="rounded-full bg-primary/[.07] px-3.5 py-1.5 text-sm font-medium text-link">
            {chip}
          </li>
        ))}
      </ul>
    </section>
  );
}
