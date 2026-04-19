import { getPlatformSocialLinks } from "@/lib/settings/get-platform-social-links";
import { Card, CardContent } from "@/components/ui/card";
import { IconBell } from "@/lib/icons";
import Link from "@/components/link";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Linkedin } from "@/components/icons/linkedin";
import { Youtube } from "@/components/icons/youtube";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";
import type { ComponentType, SVGProps } from "react";
import { FollowCardInteractive } from "./FollowCardInteractive";

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

export async function FollowCard() {
  const socialLinks = await getPlatformSocialLinks();

  return (
    <Card className="flex-none">
      <CardContent className="p-4 flex flex-col gap-3">

        {/* Row 1: label + social icons — Server Component (links only, zero client JS) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <IconBell className="h-4 w-4 shrink-0 text-primary" />
            <h2 className="text-xs font-semibold text-muted-foreground uppercase shrink-0">
              تابعنا
            </h2>
          </div>
          {socialLinks.length > 0 && (
            <nav className="flex flex-wrap gap-1" aria-label="روابط وسائل التواصل الاجتماعي">
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
          )}
        </div>

        {/* Row 2+3: newsletter form + expandable links — Client */}
        <FollowCardInteractive />

      </CardContent>
    </Card>
  );
}
