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
  /** Icon only, a square 40px button — the label stays for screen readers (article bar, 3 Oct 2026). */
  iconOnly?: boolean;
}

/**
 * The solid-accent styling of the primary slot, exported so a page that fills it with its
 * own control (see `primarySlot`) is visually identical to a page that passes a link.
 * The mark's diamond goes WHITE here — brand teal on brand teal was invisible (measured
 * 21 Aug).
 */
// ٤٤px (خالد ٣ أكتوبر ٢٠٢٦): نزل من ٤٨ إلى ٤٠ ثم رجع ٤٤ — حدُّ أبل الأدنى للّمس. هذا الزرُّ مصدرُ دخل
// العميل فالضغطةُ لازم تكون مضمونة، والفرقُ ٤px من ٨٤٤ (٧٩٪→٧٨٪ للمحتوى). الشريطُ ٦٥→٥٧.
export const CTA_BAR_PRIMARY_CLASS = cn(
  "h-11 max-lg:h-11 min-w-0 flex-1 gap-1.5 rounded-lg px-2.5 text-[13px] ring-1 ring-accent/35 focus-visible:ring-accent",
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
  /** Soft wash button — the quieter second door. Optional: the article drops it when it would
   *  repeat the main button (its WhatsApp next to a WhatsApp CTA — زرّ المقال flow, 3 Oct 2026). */
  secondary?: CtaBarLink;
  /** Between the two buttons — the article puts the partner's logo here (opens their sheet). */
  middleSlot?: ReactNode;
  /**
   * `fixed` (default): pinned under the header, and it reserves its own room through the
   * `[data-mobile-cta-bar]` hooks in globals.css. `inline`: the same two buttons as a row in
   * the page's flow — `/modonty`'s phone landing puts them under its search (Khalid, 26 Sep
   * 2026 design). Inline drops the data hook, so no top padding and no sticky offset.
   * `bottom`: pinned to the bottom edge, under the thumb — partner sites (Khalid, 4 Oct 2026).
   * Under the header it sat behind the partner's own header: measured on Galaxy S24 (360×780)
   * 28 of its 57px showed, on Galaxy A55 (480×1040) none. No data hook (that hook pads the TOP);
   * the page reserves the bottom room itself, and the iPhone home indicator gets its inset.
   */
  placement?: "fixed" | "inline" | "bottom";
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
export function MobileCtaBar({ ariaLabel, primary, primarySlot, secondary, middleSlot, placement = "fixed" }: MobileCtaBarProps) {
  const PrimaryIcon = primary?.icon;
  const SecondaryIcon = secondary?.icon;
  const inline = placement === "inline";
  const bottom = placement === "bottom";
  return (
    // The marks' diamonds default to the brand accent here; the solid button below flips
    // them to white, where accent-on-accent would vanish.
    <nav
      aria-label={ariaLabel}
      // `lg:hidden`, not `lg:hidden` (Khalid, 21 Aug — mobile refactor): the columns only go
      // side by side at `lg`, so 768–1023 is still a single-column reading screen and still
      // wants the bar. It is a PAIR with `lg:pb-0` on the column layouts — the padding that
      // clears this bar has to end exactly where the bar does, or it covers the last block.
      {...(inline || bottom ? {} : { "data-mobile-cta-bar": "" })}
      className={
        inline
          ? "lg:hidden"
          : bottom
            ? "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm supports-[backdrop-filter]:bg-background/90 lg:hidden"
            : "fixed inset-x-0 top-14 z-30 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/90 lg:hidden"
      }
    >
      <div className={cn("flex items-center gap-2", inline ? "" : "px-3 py-1.5")}>
        {primary && PrimaryIcon ? (
          <Link
            href={primary.href}
            {...(primary.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={cn(buttonVariants({ variant: "ghost" }), CTA_BAR_PRIMARY_CLASS)}
          >
            <PrimaryIcon // `!` needed: the Button's own `[&_svg]:size-4` rule outranks a plain class, which
            // pinned the mark at 16px next to a 14px/700 label. Material 3 puts the standard
            // icon at 24 inside a ≥48 target; Apple asks the symbol to match the label's weight.
            className="!size-5 shrink-0" aria-hidden />
            {/* ينقص بنقاط ولا يطلع برّا الزرّ — نصُّ زرّ المقال يكتبه الكاتب وقد يطول (٣ أكتوبر ٢٠٢٦). */}
            <span className="min-w-0 truncate">{primary.label}</span>
          </Link>
        ) : (
          primarySlot
        )}

        {middleSlot}

        {secondary && SecondaryIcon ? (
        <Link
          href={secondary.href}
          {...(secondary.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          aria-label={secondary.iconOnly ? secondary.label : undefined}
          className={cn(buttonVariants({ variant: "ghost" }), cn("h-11 max-lg:h-11 min-w-0 gap-1.5 rounded-lg px-2.5 text-[13px] ring-1 ring-accent/35 focus-visible:ring-accent", "bg-accent/10 text-link-accent hover:text-link-accent", secondary.iconOnly ? "w-11 flex-none px-0" : "flex-1"))}
        >
          <SecondaryIcon // `!` needed: the Button's own `[&_svg]:size-4` rule outranks a plain class, which
          // pinned the mark at 16px next to a 14px/700 label. Material 3 puts the standard
          // icon at 24 inside a ≥48 target; Apple asks the symbol to match the label's weight.
          className="!size-5 shrink-0" aria-hidden />
          {secondary.iconOnly ? null : <span className="min-w-0 truncate">{secondary.label}</span>}
        </Link>
        ) : null}
      </div>
    </nav>
  );
}
