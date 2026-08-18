import type { SVGProps } from "react";

import { detectSocialPlatform, type SocialPlatform } from "../../lib/partner-site/detect-social-platform";
import { SocialFacebookOutline } from "../icons/facebook";
import { Instagram } from "../icons/instagram";
import { Linkedin } from "../icons/linkedin";
import { RoundSnapchat } from "../icons/snapchat";
import { Telegram } from "../icons/telegram";
import { TiktokLogoLight } from "../icons/tiktok";
import { Twitter } from "../icons/twitter";
import { Youtube } from "../icons/youtube";
import { Whatsapp } from "../icons/whatsapp";
import { cn } from "../../lib/utils/index";

type IconComponent = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

const ICONS: Record<SocialPlatform, { Icon: IconComponent; label: string }> = {
  x: { Icon: Twitter, label: "إكس" },
  instagram: { Icon: Instagram, label: "إنستغرام" },
  facebook: { Icon: SocialFacebookOutline, label: "فيسبوك" },
  linkedin: { Icon: Linkedin, label: "لينكدإن" },
  youtube: { Icon: Youtube, label: "يوتيوب" },
  tiktok: { Icon: TiktokLogoLight, label: "تيك توك" },
  snapchat: { Icon: RoundSnapchat, label: "سناب شات" },
  telegram: { Icon: Telegram, label: "تيليغرام" },
  whatsapp: { Icon: Whatsapp, label: "واتساب" },
};

interface SocialLinksProps {
  /** `Client.sameAs` as stored — unknown hosts are skipped, order preserved. */
  urls: readonly string[];
  className?: string;
  /** Icon box in px (the SVG fills it). Footer default 20 — Flowbite/Tailwind convention. */
  size?: number;
  /** Render inert (console previews) — no anchors, no navigation. */
  inert?: boolean;
}

/**
 * The partner's social accounts as a row of brand icons — read straight from what he
 * saved under «بيانات نشاطك» (`sameAs`). Same component in the console preview and on
 * the live site, so what he sees is what ships (Khalid 2026-08-17).
 */
export function SocialLinks({ urls, className, size = 20, inert = false }: SocialLinksProps) {
  const links = urls
    .map((url) => ({ url, platform: detectSocialPlatform(url) }))
    .filter((l): l is { url: string; platform: SocialPlatform } => l.platform !== null);
  if (links.length === 0) return null;

  return (
    <ul className={cn("flex items-center gap-4", className)} aria-label="حساباتنا">
      {links.map(({ url, platform }) => {
        const { Icon, label } = ICONS[platform];
        const icon = <Icon width={size} height={size} aria-hidden />;
        return (
          <li key={url}>
            {inert ? (
              <span className="block text-muted-foreground" title={label}>{icon}</span>
            ) : (
              <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="block text-muted-foreground transition-colors hover:text-foreground">
                {icon}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
