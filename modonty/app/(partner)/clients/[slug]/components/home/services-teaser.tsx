import Link from "next/link";
import { IconBriefcase } from "@/lib/icons";
import type { PartnerSite } from "../../helpers/get-partner-site";
import { SectionHeading } from "./section-heading";

interface ServicesTeaserProps {
  services: PartnerSite["services"];
  base: string;
}

/**
 * Up to four services as cards. The data has only title · description? · icon? (no price,
 * no image) — so the card is icon + title + one line, and every card points at the
 * request card. Hidden when the partner listed nothing.
 */
export function ServicesTeaser({ services, base }: ServicesTeaserProps) {
  const items = services.filter((s) => s.title?.trim()).slice(0, 4);
  if (items.length === 0) return null;
  const cols = items.length >= 4 ? "md:grid-cols-4" : items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <section id="services" className="mx-auto max-w-[1216px] px-4">
      <SectionHeading eyebrow="ماذا يقدّم" title="خدماته" more={services.length > 4 ? { href: `${base}/services`, label: "كل الخدمات" } : undefined} />
      <div className={`mt-8 grid gap-4 ${cols}`}>
        {items.map((s) => (
          <div key={s.title} className="rounded-lg bg-card ring-1 ring-border p-6 transition-[transform,box-shadow] motion-safe:hover:-translate-y-1 hover:ring-primary/40">
            <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-2xl text-primary" aria-hidden>
              {s.icon?.trim() ? s.icon : <IconBriefcase className="h-6 w-6" />}
            </span>
            <h3 className="mt-4 text-lg font-bold text-foreground">{s.title}</h3>
            {s.description?.trim() ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p> : null}
            <Link href={`${base}#request`} className="mt-4 inline-block text-sm text-primary hover:underline underline-offset-4">
              اطلب هذه الخدمة ›
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
