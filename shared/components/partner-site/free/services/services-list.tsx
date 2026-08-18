import { Briefcase } from "lucide-react";

import { WhatsAppButton } from "../../parts/whatsapp-button";
import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/**
 * «خدماتنا — بالتفصيل» — the services page's core: a benefit-led headline, then one row
 * per service (icon · title · full description · ask button). Guides agree the page is
 * headline → detailed descriptions → proof → FAQ → CTA (Webflow, Squarespace, SEO+).
 */
export function ServicesList({ data }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="services" eyebrow="ماذا نقدّم" heading={data.hero.slogan ? `خدماتنا — ${data.hero.slogan}` : `خدمات ${data.name}`}>
      <ul className="divide-y">
        {data.services.map((s) => (
          <li key={s.title} className="grid gap-4 py-8 md:grid-cols-[auto_1fr_auto] md:items-start">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Briefcase className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
              {s.description ? (
                <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">{s.description}</p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">اسألنا عن التفاصيل — نردّ في نفس اليوم.</p>
              )}
            </div>
            <div className="md:pt-1">
              <WhatsAppButton href={data.whatsappHref} />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
