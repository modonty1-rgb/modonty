import { asMedia } from "../../optimized-image";
import { PartnerAvatar, type PartnerAvatarSize } from "../../partner-avatar/PartnerAvatar";
import { cn } from "../../../lib/utils/index";

export interface BrandLogoProps {
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
  /** One of the three shared avatar steps. Header default `small`, footer `standard`. */
  size?: PartnerAvatarSize;
  /** White text — for bars drawn over an image or a brand-colour band. */
  light?: boolean;
  /**
   * Extra classes on the tagline line. A header that spends its width on other controls
   * passes `max-md:hidden`: a two-word fragment ending in an ellipsis reads as broken,
   * while an absent secondary line reads as deliberate — and the industry and city are
   * repeated in «من نحن» and in the footer either way.
   */
  taglineClassName?: string;
}

/** Logo + name (+ tagline) — the same block in every header and footer template. */
export function BrandLogo({ name, tagline, logoUrl, size = "small", light = false, taglineClassName }: BrandLogoProps) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      {/* Was a `rounded-sm bg-white` square at a free px size. The white was the halo, the square
          showed the white printed into the corners of a partner's logo file, and the free size
          is how four different logo sizes appeared across the site. */}
      <PartnerAvatar media={logoUrl ? asMedia(logoUrl, name) : null} name={name} size={size} />
      <span className="min-w-0 leading-tight">
        <span className={cn("block truncate text-base font-bold", light && "text-white")}>{name}</span>
        {tagline && (
          <span className={cn("block truncate text-xs", light ? "text-white/75" : "text-muted-foreground", taglineClassName)}>{tagline}</span>
        )}
      </span>
    </span>
  );
}
