import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";
import { IconActivity, IconHome } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import type { ComponentType } from "react";

const text = messages.about.cornerstones;

/**
 * The three things modonty always gives a partner, in the fixed order the brand rules
 * demand — page, then trust wall, then live numbers (never reordered, never trimmed).
 * The middle one keeps the real `ModontyTrustMark` rather than a generic shield: it is
 * the exact mark a visitor sees on every partner card, so the promise here is literally
 * the badge they will recognise later, not an abstract icon standing in for it.
 */
const ICONS: ComponentType<{ className?: string }>[] = [IconHome, ModontyTrustMark, IconActivity];

export function Cornerstones() {
  return (
    <section aria-labelledby="cornerstones-heading" className="space-y-4">
      <div>
        <h2 id="cornerstones-heading" className="text-lg font-bold text-foreground">
          {text.sectionTitle}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{text.sectionSubtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {text.items.map((item, index) => {
          const Icon = ICONS[index] ?? IconActivity;
          return (
            <div key={item.title} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
              <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
