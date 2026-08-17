import { LinkCard } from "@/components/shared/link-card/LinkCard";
import { IconCalendarCheck, IconShoppingBag } from "@/lib/icons";

// Booking and shopping: one LinkCard each, stacked (Khalid, 2026-08-16) — the same
// card shape used across the site, so each reads as «go somewhere» at a glance.
const actions = [
  { href: "/booking", title: "احجز الآن", description: "احجز موعدك عند شريك موثوق", icon: IconCalendarCheck },
  { href: "/shop", title: "تسوّق الآن", description: "تسوّق منتجات موثوقة", icon: IconShoppingBag },
] as const;

export function CommerceActions() {
  return (
    <section aria-label="الحجز والتسوّق" className="space-y-3">
      {actions.map((action) => (
        <LinkCard key={action.href} {...action} />
      ))}
    </section>
  );
}
