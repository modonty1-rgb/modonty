import type { ComponentType, SVGProps } from "react";
import type { SocialChannel } from "@prisma/client";
import { AtSign } from "lucide-react";

import {
  IconFacebook,
  IconInstagram,
  IconLinkedin,
  IconSnapchat,
  IconTiktok,
  IconTwitter,
  IconYoutube,
} from "@modonty/shared/lib/icons";
import { cn } from "@/lib/utils";

import { CHANNEL_META } from "../helpers/social-labels";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * أيقونات القنوات من سجلّ الأيقونات المشترك (`shared/lib/icons.ts`) — لا `react-icons` كالقديم.
 * Threads لا أيقونة له في السجلّ، فيأخذ `AtSign` (أقرب شكل لشعاره). القديم كان يعرض «th»
 * بحرفين لأن مكوّن الجدول لم يعرفه (`channel-icon.tsx:11-19`).
 */
export const CHANNEL_ICON: Record<SocialChannel, IconComponent> = {
  INSTAGRAM: IconInstagram,
  TIKTOK: IconTiktok,
  X: IconTwitter,
  FACEBOOK: IconFacebook,
  YOUTUBE: IconYoutube,
  LINKEDIN: IconLinkedin,
  SNAPCHAT: IconSnapchat,
  THREADS: AtSign as unknown as IconComponent,
};

/**
 * مربّع القناة الملوّن. بلا رابط يبهت (لم يُنشر بعد)، وبرابط يصير زرّاً يفتح المنشور على
 * المنصّة — نفس سلوك القديم بعد النشر (`CalendarTable.tsx:935-946`).
 */
export function ChannelIcon({ channel, href, size = "sm" }: { channel: SocialChannel; href?: string | null; size?: "sm" | "md" }) {
  const meta = CHANNEL_META[channel];
  const Icon = CHANNEL_ICON[channel];
  const hasLink = Boolean(href);
  const inner = (
    <span
      title={hasLink ? `افتح على ${meta.label}` : meta.label}
      aria-label={meta.label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded transition-opacity",
        size === "sm" ? "h-5 w-5" : "h-6 w-6",
        meta.bg,
        meta.fg,
        hasLink ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-35",
      )}
    >
      <Icon className={size === "sm" ? "h-[11px] w-[11px]" : "h-3.5 w-3.5"} />
    </span>
  );
  if (!hasLink || !href) return inner;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  );
}
