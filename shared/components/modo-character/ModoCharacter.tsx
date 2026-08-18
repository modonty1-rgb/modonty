import { BRAND_CHARACTER_URL } from "../../lib/brand-assets";
import { OptimizedImage, asMedia } from "../optimized-image";

export interface ModoCharacterProps {
  /** Rendered width hint, e.g. `"32px"` or `"(min-width:640px) 48px, 44px"`. */
  sizes: string;
  /**
   * True when the name «مودو» is already written next to it, so the image adds nothing for a
   * screen reader and repeating it is noise.
   */
  decorative?: boolean;
}

/**
 * Modo's face, everywhere it appears.
 *
 * Khalid's rule (2026-08-18): wherever Modo shows up it shows up as ITSELF, never a generic
 * sparkle icon — it is the paid-acquisition funnel, and the visitor has to recognise it across
 * the site. It lives in `shared/` because the artwork is still being designed: one file to
 * change when it changes, instead of the six places that each hand-rolled the same image with
 * three different `alt` strings («» · «مودو» · «مدونتي الذكية»).
 *
 * It FILLS its parent instead of setting its own size — every caller already wraps it in a
 * box that owns the shape and the responsive width (`size-11 sm:size-12`, `size-7`, …), and a
 * fixed inline size here would fight that. The parent must be positioned and clip overflow.
 */
export function ModoCharacter({ sizes, decorative = false }: ModoCharacterProps) {
  return (
    // The component brings its OWN positioned box. `fill` resolves against the nearest
    // positioned ancestor, so a caller who forgot `relative` had the face stretch across the
    // whole viewport — measured live 2026-08-18 on the greeting, and the same failure is already
    // recorded from nine other places in this repo. Nobody can forget it here.
    <span className="relative block h-full w-full overflow-hidden">
      <OptimizedImage
        media={asMedia(BRAND_CHARACTER_URL, decorative ? null : "مودو")}
        alt={decorative ? "" : "مودو"}
        fill
        sizes={sizes}
        className="object-cover"
      />
    </span>
  );
}
