import Link from "@/components/link";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Linkedin } from "@/components/icons/linkedin";
import { Youtube } from "@/components/icons/youtube";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";
import { Whatsapp } from "@/components/icons/whatsapp";
import { Telegram } from "@/components/icons/telegram";
import type { ComponentType, SVGProps } from "react";
import type { SocialLink } from "@/lib/settings/get-platform-social-links";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICON_MAP: Record<string, IconComponent> = {
  facebook: SocialFacebookOutline,
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,
  instagram: Instagram,
  tiktok: TiktokLogoLight,
  snapchat: RoundSnapchat,
  whatsapp: Whatsapp,
  telegram: Telegram,
};

interface PlatformSocialLinksProps {
  socialLinks: SocialLink[];
  className?: string;
}

// Platform social icons — pure server component (links only, zero client JS).
export function PlatformSocialLinks({ socialLinks, className }: PlatformSocialLinksProps) {
  if (socialLinks.length === 0) return null;

  return (
    <nav className={className ?? "flex flex-wrap gap-1"} aria-label="روابط وسائل التواصل الاجتماعي">
      {socialLinks.map(({ key, href, label }) => {
        const Icon = ICON_MAP[key];
        if (!Icon) return null;
        return (
          <Link
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center p-0.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
            aria-label={label}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </Link>
        );
      })}
    </nav>
  );
}
