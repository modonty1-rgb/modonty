import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { IconArticle, IconImage, IconPlay, IconVideo } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { messages } from "@/lib/i18n/messages";
import type { ComponentType } from "react";

const text = messages.shared.partnerCapabilities;

export interface PartnerCapabilities {
  hasWhatsapp?: boolean;
  galleryCount?: number;
  hasVideo?: boolean;
  reelCount?: number;
  articleCount?: number;
}

type Capability = { icon: ComponentType<{ className?: string }>; label: string };

/**
 * What waits on the partner's page, in the order a visitor cares about: talk to him,
 * see his work, watch him, then read him.
 */
function collect(capabilities: PartnerCapabilities): Capability[] {
  const withCount = (label: string, count: number) => `${label} (${count.toLocaleString("ar-SA")})`;
  const found: Capability[] = [];
  if (capabilities.hasWhatsapp) found.push({ icon: WhatsAppIcon, label: text.whatsappChat });
  if (capabilities.galleryCount) found.push({ icon: IconImage, label: withCount(text.photoGallery, capabilities.galleryCount) });
  if (capabilities.hasVideo) found.push({ icon: IconVideo, label: text.introVideo });
  if (capabilities.reelCount) found.push({ icon: IconPlay, label: withCount(text.reels, capabilities.reelCount) });
  if (capabilities.articleCount) found.push({ icon: IconArticle, label: withCount(text.articles, capabilities.articleCount) });
  return found;
}

interface CapabilityIconsProps extends PartnerCapabilities {
  className?: string;
}

/**
 * A quiet strip of icons saying what the visitor will find on the partner's page —
 * WhatsApp, a photo gallery, a video, reels, articles. Icons, not numbers: at this size
 * the visitor is scanning for «هل عنده اللي أبيه؟», and five small marks answer that
 * faster than five counters would (Khalid, 2026-08-16). Each carries its meaning as text
 * for screen readers and as a native tooltip for the mouse.
 */
export function CapabilityIcons({ className, ...capabilities }: CapabilityIconsProps) {
  const found = collect(capabilities);
  if (found.length === 0) return null;

  return (
    <ul className={cn("flex items-center gap-1.5", className)}>
      {found.map(({ icon: Icon, label }) => (
        <li
          key={label}
          title={label}
          className="grid size-7 place-items-center rounded-full bg-muted/60 text-muted-foreground transition-colors sm:hover:bg-primary/10 sm:hover:text-link"
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="sr-only">{label}</span>
        </li>
      ))}
    </ul>
  );
}
