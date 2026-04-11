import { cacheTag, cacheLife } from "next/cache";
import Link from "@/components/link";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Linkedin } from "@/components/icons/linkedin";
import { Youtube } from "@/components/icons/youtube";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const iconLinkClass =
  "inline-flex items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors";

const SOCIAL_CONFIG: { key: string; field: string; label: string; icon: IconComponent }[] = [
  { key: "facebook",  field: "facebookUrl",  label: "فيسبوك",       icon: SocialFacebookOutline },
  { key: "linkedin",  field: "linkedInUrl",  label: "لينكد إن",     icon: Linkedin },
  { key: "youtube",   field: "youtubeUrl",   label: "يوتيوب",       icon: Youtube },
  { key: "twitter",   field: "twitterUrl",   label: "إكس / تويتر",  icon: Twitter },
  { key: "instagram", field: "instagramUrl", label: "انستغرام",     icon: Instagram },
  { key: "tiktok",    field: "tiktokUrl",    label: "تيك توك",      icon: TiktokLogoLight },
  { key: "snapchat",  field: "snapchatUrl",  label: "سناب شات",     icon: RoundSnapchat },
];

async function getSocialLinks(): Promise<{ key: string; href: string; label: string; icon: IconComponent }[]> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  const settings = await db.settings.findFirst({
    select: {
      facebookUrl: true,
      linkedInUrl: true,
      youtubeUrl: true,
      twitterUrl: true,
      instagramUrl: true,
      tiktokUrl: true,
      snapchatUrl: true,
    },
  });

  if (!settings) return [];

  return SOCIAL_CONFIG
    .map(({ key, field, label, icon }) => ({ key, href: (settings as Record<string, string | null>)[field] ?? "", label, icon }))
    .filter(item => !!item.href);
}

export async function SocialCard() {
  const socialLinks = await getSocialLinks();
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
        {socialLinks.map(({ key, href, label, icon: Icon }) => (
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
        ))}
      </nav>
    </div>
  );
}
