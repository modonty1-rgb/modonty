import type { HomeBlock } from "../home";
import { ServicesList } from "./services-list";
import { BookingBlock } from "../booking/booking-block";
import { TrustStrip } from "../trust/trust-strip";
import { StatsRow } from "../stats/stats-row";
import { TestimonialsGrid } from "../testimonials/testimonials-grid";
import { FaqAccordion } from "../faq/faq-accordion";
import { ContactCards } from "../contact/contact-cards";
import { FinalCta } from "../cta/final-cta";

/**
 * «خدماتنا», block by block — what the guides agree a services page needs (Webflow «8
 * essential elements of a service page» · Squarespace «Services page design» · SEO+):
 * benefit-led headline + detailed descriptions → why us (credentials · numbers) → social
 * proof → FAQ → how to reach us → CTA. Same data object as the home page.
 */
export const SERVICES_BLOCKS: readonly HomeBlock[] = [
  { key: "services", name: "الخدمات بالتفصيل", toggleable: false, isEmpty: (d) => d.services.length === 0, Component: ServicesList },
  { key: "booking", name: "احجز", toggleable: true, isEmpty: (d) => d.booking.mode === "NONE", Component: BookingBlock },
  { key: "trust", name: "شريط الثقة", toggleable: true, isEmpty: (d) => !d.trust.verified && d.trust.credentials.length === 0, Component: TrustStrip },
  { key: "stats", name: "أرقامنا", toggleable: true, isEmpty: (d) => d.stats.length === 0, Component: StatsRow },
  { key: "testimonials", name: "آراء العملاء", toggleable: true, isEmpty: (d) => d.testimonials.length === 0, Component: TestimonialsGrid },
  { key: "faq", name: "الأسئلة الشائعة", toggleable: true, isEmpty: (d) => d.faqs.length === 0, Component: FaqAccordion },
  { key: "contact", name: "تواصل", toggleable: true, isEmpty: (d) => !d.contact.address && !d.contact.email && !d.phone, Component: ContactCards },
  { key: "cta", name: "النداء الأخير", toggleable: false, isEmpty: () => false, Component: FinalCta },
] as const;
