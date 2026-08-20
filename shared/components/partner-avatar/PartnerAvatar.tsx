import { OptimizedImage, type ImageMedia } from "../optimized-image";
import { cx } from "../../lib/cx";

/**
 * The partner's logo, drawn the same way everywhere.
 *
 * Khalid, 19 Aug: «الأفاتار تبع العميل تشيلها الكومبونت … عشان تكون ستاندر في كل مكان». It was
 * being hand-built at every call site — measured across modonty: four sizes (32 · 44 · 48 · 56),
 * `object-contain` in some places and `object-cover` in others (which crops a logo), padding of
 * p-1 / p-1.5 / none, and three different frames: `ring-1 ring-border`, `ring-2 ring-border`,
 * and `bg-background ring-2 ring-background`.
 *
 * That last one is the pale halo Khalid kept seeing around logos: `--background` is a near-white
 * warm grey, so a white disc plus a white ring sat behind every logo — invisible on a light card,
 * a smudge on a dark banner. There is no fill here at all; the logo sits on whatever is behind
 * it, inside a hairline of the theme's own border colour.
 *
 * `object-contain` always: a logo is artwork with a name in it, and `cover` cuts the name off.
 */

// Three sizes, no more (Khalid, 19 Aug) — «standard» is the one he approved on the partner card
// under an article, and the other two are a step down and a step up from it. Four sizes was how
// the drift started: every new call site invented the number it happened to need.
const SIZES = {
  /** Inline rows and compact strips. */
  small: { box: "size-8", px: 32 },
  /** The default everywhere — card headers, list rows, the partner card. */
  standard: { box: "size-12", px: 48 },
  /** A partner's own page, where the logo is the subject rather than a label. */
  big: { box: "size-20", px: 80 },
} as const;

export type PartnerAvatarSize = keyof typeof SIZES;

interface PartnerAvatarProps {
  /** The client's logo media row. When absent, the initial is shown instead. */
  media?: ImageMedia | null;
  /** The partner's name — the alt text, and the initial when there is no logo. */
  name: string;
  size?: PartnerAvatarSize;
  className?: string;
}

export function PartnerAvatar({ media, name, size = "standard", className }: PartnerAvatarProps) {
  const { box, px } = SIZES[size];
  // Always a full circle, and no way for a call site to change it. It briefly took a
  // `radiusClassName` so the partner card could pass the brand's `rounded-[28%]` — and that one
  // prop reintroduced the whole problem: partner logos are square files with white printed into
  // the corners (sampled 19 Aug: the corner pixels of this partner's 500×500 logo are
  // rgba(255,255,255,255)). A circle clips those corners away; a squircle leaves them showing.
  // Same component, same image, two different results — which is exactly what one shared avatar
  // exists to prevent.
  const shell = cx(
    "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border",
    box,
    className,
  );

  if (!media) {
    return (
      <span className={cx(shell, "bg-secondary font-bold text-secondary-foreground")} aria-hidden>
        {name.trim().charAt(0)}
      </span>
    );
  }

  return (
    <span className={shell}>
      <OptimizedImage
        media={media}
        alt={name}
        width={px}
        height={px}
        className="size-full object-contain"
        sizes={`${px}px`}
      />
    </span>
  );
}
