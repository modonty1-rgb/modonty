import { OptimizedImage, asMedia } from "../../optimized-image";
import { cn } from "../../../lib/utils/index";

export interface BrandLogoProps {
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
  /** Logo box in px. Header default 36, footer 40. */
  size?: number;
  /** White text — for bars drawn over an image or a brand-colour band. */
  light?: boolean;
}

/** Logo + name (+ tagline) — the same block in every header and footer template. */
export function BrandLogo({ name, tagline, logoUrl, size = 36, light = false }: BrandLogoProps) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      {logoUrl ? (
        <span className="relative shrink-0 overflow-hidden rounded-sm bg-white" style={{ width: size, height: size }}>
          <OptimizedImage media={asMedia(logoUrl, name)} alt={name} fill sizes="avatar" className="object-contain" />
        </span>
      ) : (
        <span
          className="grid shrink-0 place-items-center rounded-sm bg-muted text-xs text-muted-foreground"
          style={{ width: size, height: size }}
          aria-hidden
        >
          {name.slice(0, 1)}
        </span>
      )}
      <span className="min-w-0 leading-tight">
        <span className={cn("block truncate text-base font-bold", light && "text-white")}>{name}</span>
        {tagline && (
          <span className={cn("block truncate text-xs", light ? "text-white/75" : "text-muted-foreground")}>{tagline}</span>
        )}
      </span>
    </span>
  );
}
