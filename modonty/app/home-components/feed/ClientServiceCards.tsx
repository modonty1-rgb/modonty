import Link from "next/link";
import { IconCalendar, IconChevronLeft, IconShoppingBag } from "@/lib/icons";

interface ClientServiceCard {
  id: string;
  label: string;
  visual: "booking" | "shop";
}

interface ClientServiceCardsProps {
  services: ClientServiceCard[];
}

export function ClientServiceCards({ services }: ClientServiceCardsProps) {
  if (services.length === 0) return null;

  return (
    <section aria-labelledby="client-services-heading" className="border-t border-border pt-4">
      <div className="flex items-center gap-2">
        <span className="h-4 w-0.5 rounded-full bg-accent" aria-hidden />
        <h2 id="client-services-heading" className="text-sm font-bold text-foreground">ماذا تريد أن تفعل اليوم؟</h2>
      </div>
      <div className="mt-3 space-y-2.5">
        {services.map((service) => (
          <Link key={service.id} href={`/clients?service=${encodeURIComponent(service.id)}`} className="group relative flex min-h-[84px] items-center overflow-hidden rounded-2xl border border-primary/15 bg-card px-4 py-3 shadow-[0_12px_28px_-24px_rgba(14,6,90,0.7)] transition-[border-color,background-color,transform,box-shadow] md:hover:-translate-y-0.5 md:hover:border-accent/55 md:hover:bg-accent/[0.035] md:hover:shadow-[0_16px_30px_-22px_rgba(14,6,90,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
            <span className="absolute inset-y-4 start-0 w-0.5 rounded-full bg-accent" aria-hidden />
            <span className="flex min-w-0 flex-1 items-center gap-2 text-base font-bold text-foreground">
              {service.label}
              <IconChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-transform md:group-hover:-translate-x-0.5 md:group-hover:text-accent" aria-hidden />
            </span>
            <span className="ms-3 grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent" aria-hidden>
              {service.visual === "booking" ? <IconCalendar className="h-6 w-6" /> : <IconShoppingBag className="h-6 w-6" />}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
