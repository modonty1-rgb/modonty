import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { WhatsAppButton } from "../../parts/whatsapp-button";
import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/** «فين وكيف» — three cards: address (+ map link) · hours · phone/email/WhatsApp (Tailwind "contact section"). */
export function ContactCards({ data }: { data: HomeData; preview?: boolean }) {
  const c = data.contact;
  return (
    <Section id="contact" eyebrow="تواصل" heading="نردّ عليك في نفس اليوم">
      <div className="grid gap-6 md:grid-cols-3">
        {c.address && (
          <div className="rounded-lg p-6 ring-1 ring-border">
            <p className="flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-primary" aria-hidden /> العنوان</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{c.address}</p>
            {c.mapHref && <a href={c.mapHref} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-primary">افتح في خرائط قوقل</a>}
          </div>
        )}
        {c.hours.length > 0 && (
          <div className="rounded-lg p-6 ring-1 ring-border">
            <p className="flex items-center gap-2 text-sm font-medium"><Clock className="h-4 w-4 text-primary" aria-hidden /> ساعات العمل</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {c.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4"><span>{h.day}</span><span dir="ltr">{h.time}</span></li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-lg p-6 ring-1 ring-border">
          <p className="flex items-center gap-2 text-sm font-medium"><Phone className="h-4 w-4 text-primary" aria-hidden /> اتصل أو راسل</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {data.phone && <li><a href={`tel:${data.phone}`} dir="ltr" className="hover:text-foreground">{data.phone}</a></li>}
            {c.email && <li className="flex items-center gap-2"><Mail className="h-4 w-4" aria-hidden /><a href={`mailto:${c.email}`} className="hover:text-foreground">{c.email}</a></li>}
          </ul>
          <div className="mt-4"><WhatsAppButton href={data.whatsappHref} /></div>
        </div>
      </div>
    </Section>
  );
}
