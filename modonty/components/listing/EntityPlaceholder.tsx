import { getEntityIcon } from "@/lib/entity-utils";
import { cn } from "@/lib/utils";
import type { EntityType } from "@/lib/entity-utils";

interface EntityPlaceholderProps {
  type: EntityType;
  className?: string;
  /** Set false when the caller renders its own icon on top (e.g. Hero mosaic tiles with custom sizing). */
  showIcon?: boolean;
}

/**
 * One flat brand tone per entity type (not a multi-stop gradient) + two soft
 * off-corner blobs for depth + a fine dot texture. Colors are derived ONLY
 * from Modonty's 3 official brand hues (`app/globals.css` — --brand-navy
 * H245 · --brand-blue H240 · --brand-teal H180). No invented hues (e.g. no
 * purple) — category owns blue, industry owns teal, tag owns navy (the only
 * brand hue left), with brand blue reused as its accent glow since navy and
 * blue are both part of the same "dark family" in the brand palette.
 */
const PALETTE: Record<EntityType, { base: string; light: string; dark: string }> = {
  category: { base: "hsl(240, 65%, 20%)", light: "hsl(240, 100%, 59%)", dark: "hsl(240, 60%, 10%)" },
  industry: { base: "hsl(180, 55%, 15%)", light: "hsl(180, 100%, 42%)", dark: "hsl(180, 55%, 8%)" },
  tag: { base: "hsl(245, 87%, 19%)", light: "hsl(240, 100%, 59%)", dark: "hsl(245, 70%, 10%)" },
};

export function EntityPlaceholder({ type, className, showIcon = true }: EntityPlaceholderProps) {
  const Icon = getEntityIcon(type);
  const { base, light, dark } = PALETTE[type];

  return (
    <div className={cn("absolute inset-0", className)}>
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
        <rect width="400" height="250" fill={base} />
        <circle cx="345" cy="15" r="130" fill={light} opacity="0.4" />
        <circle cx="30" cy="245" r="150" fill={dark} opacity="0.55" />
        <pattern id={`entity-dots-${type}`} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.4" cy="1.4" r="1.4" fill="#ffffff" opacity="0.1" />
        </pattern>
        <rect width="400" height="250" fill={`url(#entity-dots-${type})`} />
      </svg>
      {showIcon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-12 w-12 text-white/70" />
        </div>
      )}
    </div>
  );
}
