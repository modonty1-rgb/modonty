import Link from "@/components/link";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Linkedin } from "@/components/icons/linkedin";
import { Youtube } from "@/components/icons/youtube";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";
import { getPlatformSocialLinks } from "@/lib/settings/get-platform-social-links";
import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICON_MAP: Record<string, IconComponent> = {
  facebook:  SocialFacebookOutline,
  linkedin:  Linkedin,
  youtube:   Youtube,
  twitter:   Twitter,
  instagram: Instagram,
  tiktok:    TiktokLogoLight,
  snapchat:  RoundSnapchat,
};

const iconLinkClass =
  "inline-flex items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors";

export async function SocialCard() {
  const socialLinks = await getPlatformSocialLinks();
  if (socialLinks.length === 0) return null;

  return (
    <div
      role="complementary"
      aria-label="تابعنا على وسائل التواصل"
      className={cn(
        "rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm flex-none min-h-0 overflow-hidden flex flex-col gap-2"
      )}
    >
      <nav
        className="flex flex-wrap justify-evenly gap-2 text-muted-foreground"
        aria-label="روابط وسائل التواصل الاجتماعي"
      >
        {socialLinks.map(({ key, href, label }) => {
          const Icon = ICON_MAP[key];
          if (!Icon) return null;
          return (
            <Link
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={iconLinkClass}
              aria-label={label}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
