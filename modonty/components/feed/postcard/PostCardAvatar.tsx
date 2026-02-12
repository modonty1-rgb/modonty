import Link from "@/components/link";
import Image from "next/image";
import { getOptimizedThumbnailUrl } from "@/lib/image-utils";

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
  index,
}: PostCardAvatarProps) {
  const initials = clientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const optimizedLogo =
    clientLogo != null
      ? getOptimizedThumbnailUrl(clientLogo, 96) ?? clientLogo
      : null;

  const isFirst = index === 0;

  return (
    <Link href={`/clients/${clientSlug}`}>
      <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xs font-semibold text-foreground">
        {optimizedLogo ? (
          <Image
            src={optimizedLogo}
            alt={clientName}
            width={40}
            height={40}
            loading={isFirst ? "eager" : "lazy"}
            fetchPriority="auto"
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    </Link>
  );
}

