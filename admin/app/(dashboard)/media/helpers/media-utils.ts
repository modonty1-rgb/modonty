import { MediaType } from "@prisma/client";
import type { BadgeProps } from "@/components/ui/badge";

export function getMediaTypeLabel(type: MediaType): string {
  switch (type) {
    case "LOGO":
      return "Logo";
    case "POST":
      return "Post";
    case "OGIMAGE":
      return "OG Image";
    case "TWITTER_IMAGE":
      return "Twitter";
    case "GENERAL":
      return "General";
    default:
      return "General";
  }
}

export function getMediaTypeBadgeVariant(type: MediaType): BadgeProps["variant"] {
  switch (type) {
    case "LOGO":
      return "default"; // Primary color
    case "POST":
      return "secondary"; // Secondary color
    case "OGIMAGE":
      return "outline"; // Accent color (using outline for distinction)
    case "TWITTER_IMAGE":
      return "default"; // Info color (using default with different styling)
    case "GENERAL":
      return "secondary"; // Muted color
    default:
      return "secondary";
  }
}

export function getMediaTypeColor(type: MediaType): string {
  switch (type) {
    case "LOGO":
      return "bg-primary text-primary-foreground";
    case "POST":
      return "bg-secondary text-secondary-foreground";
    case "OGIMAGE":
      return "bg-accent text-accent-foreground";
    case "TWITTER_IMAGE":
      return "bg-blue-500 text-white";
    case "GENERAL":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}
