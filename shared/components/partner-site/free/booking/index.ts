import type { HomeBlock } from "../home";
import { BookingBlock } from "./booking-block";
import { ContactCards } from "../contact/contact-cards";
import { FinalCta } from "../cta/final-cta";

/** «الحجز» — the page every «احجز» link lands on: the form (or the admin's link) → other ways to reach us → CTA. Whole page hides when the admin set no button. */
export const BOOKING_BLOCKS: readonly HomeBlock[] = [
  { key: "booking", name: "نموذج الحجز", toggleable: false, isEmpty: (d) => d.booking.mode === "NONE", Component: BookingBlock },
  { key: "contact", name: "طرق أخرى للتواصل", toggleable: true, isEmpty: (d) => !d.contact.address && !d.contact.email && !d.phone, Component: ContactCards },
  { key: "cta", name: "النداء الأخير", toggleable: false, isEmpty: () => false, Component: FinalCta },
] as const;
