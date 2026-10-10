import type { ComponentType } from "react";
import { IntentLink } from "@/components/shared/intent-link/IntentLink";
import { cn } from "@/lib/utils";

interface NavCapsuleItemProps {
  icon: ComponentType<{ className?: string }>;
  /** The Filled mark for the selected state; falls back to `icon` where no Filled variant exists. */
  activeIcon?: ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
  tone?: "accent";
  /** Hover/focus name bubble — desktop only; a finger has no hover, the pill already names the page. */
  tooltip?: boolean;
}

/** A short spring: the pill overshoots a little as it opens, like the app's tab capsule. */
const SPRING = "duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none";

/**
 * One stop in the «كبسولة التبويب» — shared by the desktop top nav (`NavLinksClient.tsx`) and the
 * phone bottom bar (`MobileNavCapsule.tsx`) (Khalid, 9 Oct 2026: «الدوائر في الناف بار جداً سيئة» — the
 * web nav takes the app's capsule, Claude Design system 1.0 · Components 01).
 *
 * - Selected: a filled `bg-primary` pill, 44px tall, padding 16 start / 14 end, the Filled mark
 *   plus the name 6px after it in white 14/20 bold.
 * - Resting: the Regular mark only, 24px in the secondary text colour, no circle, border or
 *   background, on a 48×48 target. The name stays in `aria-label` and in a hover/focus tooltip.
 *
 * The pill opens by animating its padding and the name's grid column (0fr → 1fr), so the width
 * grows from the mark outward instead of jumping; reduced motion switches instantly.
 */
export function NavCapsuleItem({ icon: Icon, activeIcon: ActiveIcon = Icon, label, href, active = false, tone, tooltip = false }: NavCapsuleItemProps) {
  const Glyph = active ? ActiveIcon : Icon;
  return (
    <IntentLink
      href={href}
      // `aria-current="page"` announces "you are here" to a screen reader — the pill alone cannot.
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={cn(
        "group relative flex shrink-0 items-center rounded-full transition-[background-color,color,padding,height] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        SPRING,
        active
          ? // The Filled mark's knockout ring takes the pill's colour, not the page's.
            "h-11 bg-primary pe-3.5 ps-4 text-primary-foreground [--modonty-knockout:hsl(var(--primary))]"
          : cn("h-12 px-3 hover:text-foreground", tone === "accent" ? "text-link-accent" : "text-muted-foreground"),
      )}
    >
      <Glyph className="size-6 shrink-0" />
      <span aria-hidden className={cn("grid transition-[grid-template-columns,margin]", SPRING, active ? "ms-1.5 grid-cols-[1fr]" : "grid-cols-[0fr]")}>
        <span className="overflow-hidden whitespace-nowrap text-sm font-bold leading-5">{label}</span>
      </span>
      {tooltip && !active && (
        <span role="tooltip" className="pointer-events-none absolute left-1/2 top-[calc(100%+0.5rem)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/70 bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          {label}
        </span>
      )}
    </IntentLink>
  );
}
