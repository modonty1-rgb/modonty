import { SiteLink } from "../../parts/site-link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { WhatsAppButton } from "../../parts/whatsapp-button";
import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/** «أين وكيف» — up to three cards: address (+ map link) · hours · phone/email/WhatsApp (Tailwind "contact section"). */
export function ContactCards({ data }: { data: HomeData; preview?: boolean }) {
  const c = data.contact;
  // Cards that have something to say, and columns to match (4 Oct 2026): the grid was always
  // three wide, so one card sat in a third of the row; and «اتصل أو راسل» drew even with no
  // phone, no email and no WhatsApp — a heading over an empty box.
  const reach = Boolean(data.phone || c.email || data.whatsappHref);
  const count = [Boolean(c.address), c.hours.length > 0, reach].filter(Boolean).length;
  const cols = count >= 3 ? "md:grid-cols-3" : count === 2 ? "md:grid-cols-2" : "max-w-xl";
  return (
    <Section id="contact" eyebrow="تواصل" heading="نردّ عليك بأقرب وقت">
      <div className={`grid gap-6 ${cols}`}>
        {c.address && (
          <div className="rounded-[var(--ps-radius-card,0.5rem)] p-6 ring-1 ring-border">
            <p className="flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-[hsl(var(--primary-ink,var(--primary)))]" aria-hidden /> العنوان</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{c.address}</p>
            {c.mapHref && <SiteLink href={c.mapHref} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-6 items-center text-sm font-medium max-lg:min-h-11 text-[hsl(var(--primary-ink,var(--primary)))]">افتح الاتجاهات</SiteLink>}
          </div>
        )}
        {c.hours.length > 0 && (
          <div className="rounded-[var(--ps-radius-card,0.5rem)] p-6 ring-1 ring-border">
            <p className="flex items-center gap-2 text-sm font-medium"><Clock className="h-4 w-4 text-[hsl(var(--primary-ink,var(--primary)))]" aria-hidden /> ساعات العمل</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {c.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4"><span>{h.day}</span><span>{h.time}</span></li>
              ))}
            </ul>
          </div>
        )}
        {reach && (
        <div className="rounded-[var(--ps-radius-card,0.5rem)] p-6 ring-1 ring-border">
          <p className="flex items-center gap-2 text-sm font-medium"><Phone className="h-4 w-4 text-[hsl(var(--primary-ink,var(--primary)))]" aria-hidden /> اتصل أو راسل</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {data.phone && <li><SiteLink href={`tel:${data.phone}`} dir="ltr" className="hover:text-foreground max-lg:inline-flex max-lg:min-h-11 max-lg:items-center lg:inline-flex lg:min-h-6 lg:items-center">{data.phone}</SiteLink></li>}
            {c.email && <li className="flex items-center gap-2"><Mail className="h-4 w-4" aria-hidden /><SiteLink href={`mailto:${c.email}`} className="hover:text-foreground max-lg:inline-flex max-lg:min-h-11 max-lg:items-center lg:inline-flex lg:min-h-6 lg:items-center">{c.email}</SiteLink></li>}
          </ul>
          {data.whatsappHref && <div className="mt-4"><WhatsAppButton href={data.whatsappHref} /></div>}
        </div>
        )}
      </div>
    </Section>
  );
}
