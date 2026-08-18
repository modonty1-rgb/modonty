import { IconCheckCircle } from "../../lib/icons";
import { cx } from "../../lib/cx";

export interface VerifiedBadgeProps {
  /** Size and any colour override, e.g. `"h-5 w-5 text-accent"`. Caller's classes win. */
  className?: string;
  /** What the mark claims here — «شريك موثّق» · «ناشر موثّق». */
  label?: string;
}

/**
 * The one verification mark on modonty.
 *
 * Audited 2026-08-18: the same claim was drawn three different ways — `BadgeCheck` (the
 * serrated star) in five places, `CheckCircle2` in the partner list, and a green `ShieldCheck`
 * on the partner site bar. Three shapes and three colours for one meaning taught the visitor
 * nothing, and verification is the thing modonty sells: every partner is checked against their
 * official papers, so the mark that says so has to be recognisable at a glance.
 *
 * The circled check in brand colour is the one Khalid picked. Colour is overridable because a
 * couple of surfaces sit on a filled brand background, where `text-primary` would disappear.
 */
export function VerifiedBadge({ className, label = "موثّق" }: VerifiedBadgeProps) {
  return (
    <IconCheckCircle
      className={cx("shrink-0 text-primary fill-primary/20", className)}
      aria-label={label}
      role="img"
    />
  );
}
