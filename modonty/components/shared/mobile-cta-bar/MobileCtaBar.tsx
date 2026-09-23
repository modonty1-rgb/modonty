import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode, SVGProps } from "react";

interface CtaBarLink {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** External destination (e.g. jbrseo.com) — opens in a new tab with noopener. */
  external?: boolean;
}

/**
 * The solid-accent styling of the primary slot, exported so a page that fills it with its
 * own control (see `primarySlot`) is visually identical to a page that passes a link.
 * The mark's diamond goes WHITE here — brand teal on brand teal was invisible (measured
 * 21 Aug).
 */
export const CTA_BAR_PRIMARY_CLASS = cn(
  "min-h-12 min-w-0 flex-1 gap-2 rounded-lg px-3 ring-1 ring-accent/35 focus-visible:ring-accent",
  "bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground",
  "[--modonty-booking-accent:white] [--modonty-booking-check:hsl(var(--accent))] [--modonty-shopping-accent:white] [--modonty-shopping-hub:hsl(var(--accent))]",
);

interface MobileCtaBarProps {
  /** Names the nav for assistive tech — e.g. «احجز أو تسوّق». */
  ariaLabel: string;
  /** Solid teal button — the page's main ask. Renders first (visual right in RTL). */
  primary?: CtaBarLink;
  /**
   * Use INSTEAD of `primary` when the main ask opens something in place rather than
   * navigating — `/modonty`'s «تابع مدونتي» opens the sign-in dialog, so it has to be a
   * Client Component and cannot be described by an href. Style it with
   * `CTA_BAR_PRIMARY_CLASS` so both forms look the same. Pass exactly one of the two.
   */
  primarySlot?: ReactNode;
  /** Soft wash button — the quieter second door. */
  secondary: CtaBarLink;
}

/**
 * The mobile bottom bar, made page-agnostic (Khalid, 21 Aug 2026: same structure on
 * every page, only the two CTAs' text + link change — DRY). The homepage passes
 * احجز/تسوّق, `/modonty` passes صِر شريكاً/عن مدونتي, and so on. Modo already has a
 * permanent shortcut in the sticky section bar, so repeating it here wastes the most valuable
 * mobile space. Links only — a Server Component.
 *
 * Contrast is token-guaranteed (fixed 21 Aug after Khalid's phone screenshots):
 * primary = solid `accent` with its designed `accent-foreground`; secondary text uses
 * the text-grade teal `link-accent`, which carries its own dark-mode step.
 */
export function MobileCtaBar({ ariaLabel, primary, primarySlot, secondary }: MobileCtaBarProps) {
  const PrimaryIcon = primary?.icon;
  const SecondaryIcon = secondary.icon;
  return (
    // The marks' diamonds default to the brand accent here; the solid button below flips
    // them to white, where accent-on-accent would vanish.
    <nav
      aria-label={ariaLabel}
      // `lg:hidden`, not `md:hidden` (Khalid, 21 Aug — mobile refactor): the columns only go
      // side by side at `lg`, so 768–1023 is still a single-column reading screen and still
      // wants the bar. It is a PAIR with `lg:pb-0` on the column layouts — the padding that
      // clears this bar has to end exactly where the bar does, or it covers the last block.
      data-mobile-cta-bar
      className="fixed inset-x-0 top-14 z-30 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/90 lg:hidden"
    >
      <div className="flex items-center gap-3 px-3 py-2">
        {primary && PrimaryIcon ? (
          <Link
            href={primary.href}
            {...(primary.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={buttonVariants({ variant: "ghost", className: CTA_BAR_PRIMARY_CLASS })}
          >
            <PrimaryIcon // `!` needed: the Button's own `[&_svg]:size-4` rule outranks a plain class, which
            // pinned the mark at 16px next to a 14px/700 label. Material 3 puts the standard
            // icon at 24 inside a ≥48 target; Apple asks the symbol to match the label's weight.
            className="!size-6 shrink-0" aria-hidden />
            {primary.label}
          </Link>
        ) : (
          primarySlot
        )}

        <Link
          href={secondary.href}
          {...(secondary.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={buttonVariants({ variant: "ghost", className: cn("min-h-12 min-w-0 flex-1 gap-2 rounded-lg px-3 ring-1 ring-accent/35 focus-visible:ring-accent", "bg-accent/10 text-link-accent hover:text-link-accent") })}
        >
          <SecondaryIcon // `!` needed: the Button's own `[&_svg]:size-4` rule outranks a plain class, which
          // pinned the mark at 16px next to a 14px/700 label. Material 3 puts the standard
          // icon at 24 inside a ≥48 target; Apple asks the symbol to match the label's weight.
          className="!size-6 shrink-0" aria-hidden />
          {secondary.label}
        </Link>
      </div>
    </nav>
  );
}
