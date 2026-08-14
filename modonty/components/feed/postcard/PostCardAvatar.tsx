import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { BRAND_AVATAR_RADIUS } from "@/lib/brand-avatar";


interface PostCardAvatarProps {
  clientSlug: string;
  clientName: string;
  clientLogo?: string | null;
  index?: number;
}

/**
 * Lightweight, custom avatar for the post card header.
 * Avoids chadcn's Avatar and uses a simple circle with either:
 * - Optimized client logo image, or
 * - Text initials fallback.
 */
export function PostCardAvatar({
  clientSlug,
  clientName,
  clientLogo,
  index: _index,
}: PostCardAvatarProps) {
  const initials = clientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const optimizedLogo =
    clientLogo != null
      ? clientLogo ?? clientLogo
      : null;

  return (
    <Link
      href={`/clients/${clientSlug}`}
      aria-label={`زيارة صفحة ${clientName}`}
    >
      <div className={`h-10 w-10 ${BRAND_AVATAR_RADIUS} bg-muted overflow-hidden flex items-center justify-center text-xs font-semibold text-foreground`}>
        {optimizedLogo ? (
          <OptimizedImage
            media={asMedia(optimizedLogo, clientName)}
            alt={clientName}
            width={40}
            height={40}
            sizes="40px"
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    </Link>
  );
}

