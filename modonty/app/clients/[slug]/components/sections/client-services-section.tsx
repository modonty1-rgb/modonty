import { SectionCard } from "./section-card";

export interface ClientServiceItem {
  title: string;
  description?: string | null;
  icon?: string | null;
}

interface Props {
  services: ClientServiceItem[];
}

/** Dominant «خدماتنا» feature card — 2-col service grid. Server, zero JS. Hide-if-empty. */
export function ClientServicesSection({ services }: Props) {
  const items = services.filter((s) => s.title?.trim());
  if (items.length === 0) return null;

  return (
    <SectionCard id="services" icon="🧩" title="خدماتنا" feature>
      <div className="grid grid-cols-1 gap-[11px] sm:grid-cols-2">
        {items.map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-md border bg-card p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-[0_4px_14px_-6px_hsl(var(--primary)/0.25)]"
          >
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-primary/[0.08] text-[19px] text-primary"
              aria-hidden
            >
              {s.icon?.trim() || "🔹"}
            </span>
            <div className="min-w-0">
              <h4 className="mb-0.5 text-[13.5px] font-extrabold text-foreground">{s.title}</h4>
              {s.description?.trim() && (
                <p className="text-[11.5px] leading-[1.55] text-muted-foreground">{s.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
