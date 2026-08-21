import Link from "next/link";
import { ModoCharacter } from "@modonty/shared/components/modo-character/ModoCharacter";
import { buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";

interface CtaBarLink {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** External destination (e.g. jbrseo.com) — opens in a new tab with noopener. */
  external?: boolean;
}

interface MobileCtaBarProps {
  /** Names the nav for assistive tech — e.g. «احجز أو تسوّق». */
  ariaLabel: string;
  /** Solid teal button — the page's main ask. Renders first (visual right in RTL). */
  primary: CtaBarLink;
  /** Soft wash button — the quieter second door. */
  secondary: CtaBarLink;
}

/**
 * The mobile bottom bar, made page-agnostic (Khalid, 21 Aug 2026: same structure on
 * every page, only the two CTAs' text + link change — DRY). The homepage passes
 * احجز/تسوّق, `/modonty` passes صِر شريكاً/عن مدونتي, and so on. Modo in the middle is
 * part of the structure and never changes. Links only — a Server Component.
 *
 * Contrast is token-guaranteed (fixed 21 Aug after Khalid's phone screenshots):
 * primary = solid `accent` with its designed `accent-foreground`; secondary text uses
 * the text-grade teal `link-accent`, which carries its own dark-mode step.
 */
export function MobileCtaBar({ ariaLabel, primary, secondary }: MobileCtaBarProps) {
  const PrimaryIcon = primary.icon;
  const SecondaryIcon = secondary.icon;
  return (
    // The marks' diamonds default to the brand accent here; the solid button below flips
    // them to white, where accent-on-accent would vanish.
    <nav
      aria-label={ariaLabel}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden [--modonty-booking-accent:hsl(var(--accent))] [--modonty-shopping-accent:hsl(var(--accent))]"
    >
      <Link
        href="/modo-chat"
        aria-label="افتح مودو"
        className={buttonVariants({
          variant: "ghost",
          className:
            "absolute inset-x-0 bottom-[calc(1.875rem+env(safe-area-inset-bottom))] z-50 mx-auto h-12 w-14 flex-col gap-0.5 rounded-b-lg rounded-t-xl border-0 bg-background px-1 py-1 text-foreground shadow-none hover:bg-background hover:text-foreground focus-visible:ring-accent",
        })}
      >
        <span className="pointer-events-none absolute inset-0 rounded-t-xl border-x border-t border-accent/35 bg-background" aria-hidden="true" />
        <span className="relative z-10 flex shrink-0 items-center justify-center">
          <span className="relative block size-7 shrink-0 overflow-hidden rounded-full">
            <ModoCharacter sizes="28px" decorative />
          </span>
        </span>
        <span className="relative z-10 text-[8px] font-normal leading-none text-link-accent">مودو</span>
      </Link>

      <div className="flex items-center px-3 py-2">
        <Link
          href={primary.href}
          {...(primary.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          // The brand mark's diamond goes WHITE on this solid-accent button — brand teal
          // on brand teal was invisible (measured 21 Aug). On the wash button below, the
          // diamond simply inherits the text colour, which is already contrast-checked.
          className={buttonVariants({ variant: "ghost", className: cn("min-h-12 min-w-0 flex-1 gap-2 rounded-se-none px-3 ring-1 ring-accent/35 focus-visible:ring-accent", "bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground", "[--modonty-booking-accent:white] [--modonty-booking-check:hsl(var(--accent))] [--modonty-shopping-accent:white] [--modonty-shopping-hub:hsl(var(--accent))]") })}
        >
          <PrimaryIcon // `!` needed: the Button's own `[&_svg]:size-4` rule outranks a plain class, which
          // pinned the mark at 16px next to a 14px/700 label. Material 3 puts the standard
          // icon at 24 inside a ≥48 target; Apple asks the symbol to match the label's weight.
          className="!size-6 shrink-0" aria-hidden />
          {primary.label}
        </Link>

        <span className="w-14 shrink-0" aria-hidden="true" />

        <Link
          href={secondary.href}
          {...(secondary.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={buttonVariants({ variant: "ghost", className: cn("min-h-12 min-w-0 flex-1 gap-2 rounded-ss-none px-3 ring-1 ring-accent/35 focus-visible:ring-accent", "bg-accent/10 text-link-accent hover:text-link-accent") })}
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
