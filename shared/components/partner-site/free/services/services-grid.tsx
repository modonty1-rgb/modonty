import { serviceIcon } from "./parts/service-icon";
import { Section } from "../home/parts/section";
import { ViewAllLink } from "../home/parts/view-all-link";
import type { HomeData } from "../home/home-data";

/** Phones show four, desktop six — the home page measured 9,762px on a phone (4 Oct 2026). */
const PHONE_SHOWN = 4;

/** «خدماتنا» — three-up cards (Tailwind "feature section" / Shopify `multicolumn`): icon, title, one line. */
export function ServicesGrid({ data }: { data: HomeData; preview?: boolean }) {
  const shown = data.services.slice(0, 6);
  // Phones: icon beside the title, not above it — six stacked cards measured ≈1,400px (4 Oct 2026).
  // One or two services left a three-column grid two-thirds or one-third empty (4 Oct 2026):
  // the columns follow the count up to three.
  const cols = shown.length === 1 ? "max-w-xl" : shown.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <Section id="services" eyebrow="ماذا نقدّم" heading="خدماتنا" tone="muted">
      <ul className={`grid gap-6 ${cols}`}>
        {shown.map((s, i) => {
          const Icon = serviceIcon(s.title, s.icon);
          return (
          <li key={s.title} className={`rounded-[var(--ps-radius-card,0.5rem)] bg-background p-6 ring-1 ring-border max-md:grid ${i >= PHONE_SHOWN ? "max-md:hidden" : ""} max-md:grid-cols-[auto_1fr] max-md:gap-x-4 max-md:p-5`}>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-[hsl(var(--primary-ink,var(--primary)))] max-md:row-span-2">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-bold text-foreground max-md:mt-0 max-md:self-center">{s.title}</h3>
            {s.description && <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{s.description}</p>}
          </li>
          );
        })}
      </ul>
      <ViewAllLink href={data.servicesHref} label="كل الخدمات" shown={Math.min(PHONE_SHOWN, shown.length)} total={data.services.length} />
    </Section>
  );
}
