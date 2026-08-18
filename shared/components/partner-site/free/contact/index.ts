import type { HomeBlock } from "../home";
import { ContactCards } from "./contact-cards";
import { MapBlock } from "./map-block";
import { LeadForm } from "./lead-form";
import { FinalCta } from "../cta/final-cta";

/**
 * «تواصل معنا» — the page every «راسلنا» link lands on: ways to reach us (phone · email ·
 * WhatsApp · hours) → the map → the callback form → CTA. Google indexes it as the
 * contact page (ContactPoint), so it stays even though the footer repeats the basics.
 */
export const CONTACT_BLOCKS: readonly HomeBlock[] = [
  { key: "contact", name: "طرق التواصل", toggleable: false, isEmpty: (d) => !d.contact.address && !d.contact.email && !d.phone, Component: ContactCards },
  { key: "map", name: "الخريطة", toggleable: true, isEmpty: (d) => !d.contact.mapEmbedSrc, Component: MapBlock },
  { key: "lead-form", name: "نموذج «اترك رقمك»", toggleable: true, isEmpty: () => false, Component: LeadForm },
  { key: "cta", name: "النداء الأخير", toggleable: false, isEmpty: () => false, Component: FinalCta },
] as const;
