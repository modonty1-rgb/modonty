import { ModontyTrustMark } from "../icons/modonty-trust-mark";
import { cx } from "../../lib/cx";

export interface VerifiedBadgeProps {
  /** Size, e.g. `"h-5 w-5"`. Colour classes have no effect — the mark carries its own. */
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
 * Corrected 2026-08-19 (Khalid): that audit unified the shape but picked a generic circled
 * check. modonty already owns a verification mark — the «M» inside a shield, in
 * `icons/modonty-trust-mark.tsx` — and eight surfaces were already drawing it while these ten
 * drew the circled check. One meaning, two marks. This component now renders the real one, so
 * every consumer switches at once and the visitor learns a single shape.
 *
 * Colour is no longer overridable: the mark is a badge, not an interface icon, and its navy /
 * teal / white are part of it. Callers pass size only.
 */
export function VerifiedBadge({ className, label = "موثّق" }: VerifiedBadgeProps) {
  return (
    <ModontyTrustMark
      className={cx("shrink-0", className)}
      aria-label={label}
      aria-hidden={undefined}
      role="img"
    />
  );
}
