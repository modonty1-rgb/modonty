import { MediaType } from "@prisma/client";
import type { BadgeProps } from "@/components/ui/badge";
import { MEDIA_SPECS } from "@/lib/media/media-specs";

// Single source of truth = MEDIA_SPECS — every role's label lives there
// (CLIENT_MINI → "Client Mini", HERO → "Client Cover", …) so labels never drift.
export function getMediaTypeLabel(type: MediaType): string {
  return MEDIA_SPECS[type]?.label ?? "General";
}

export function getMediaTypeBadgeVariant(type: MediaType): BadgeProps["variant"] {
  switch (type) {
    case "LOGO":
      return "default"; // Primary color
    case "POST":
      return "secondary"; // Secondary color
    case "OGIMAGE":
      return "outline"; // Accent color (using outline for distinction)
    case "CLIENT_MINI":
      return "outline";
    case "TWITTER_IMAGE":
      return "default"; // Info color (using default with different styling)
    case "GENERAL":
      return "secondary"; // Muted color
    default:
      return "secondary";
  }
}
