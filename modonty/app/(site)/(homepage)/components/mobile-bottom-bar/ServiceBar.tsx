import { MobileCtaBar } from "@/components/shared/mobile-cta-bar/MobileCtaBar";
import { ModontyShoppingMark } from "@/components/icons/modonty-shopping-mark";
import { ModontyBookingMark } from "@/components/icons/modonty-booking-mark";

/**
 * The homepage's configuration of the shared mobile bottom bar (structure + Modo live
 * in MobileCtaBar — Khalid, 21 Aug 2026: each page changes only the two CTAs' text
 * and links). Homepage asks: book, or shop.
 */
export function ServiceBar() {
  return (
    <MobileCtaBar
      ariaLabel="احجز أو تسوّق"
      primary={{ href: "/booking", label: "احجز الآن", icon: ModontyBookingMark }}
      secondary={{ href: "/shop", label: "تسوّق الآن", icon: ModontyShoppingMark }}
    />
  );
}
