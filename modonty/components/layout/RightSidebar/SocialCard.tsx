import Link from "@/components/link";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Linkedin } from "@/components/icons/linkedin";
import { Youtube } from "@/components/icons/youtube";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";
import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";

const iconLinkClass =
  "inline-flex items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

function getSocialLinks(): {
  key: string;
  href: string;
  label: string;
  icon: IconComponent;
}[] {
  const items: { key: string; href: string | undefined; label: string; icon: IconComponent }[] = [
    {
      key: "facebook",
      href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL,
      label: "فيسبوك",
      icon: SocialFacebookOutline,
    },
    {
      key: "linkedin",
      href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL,
      label: "لينكد إن",
      icon: Linkedin,
    },
    {
      key: "youtube",
      href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL,
      label: "يوتيوب",
      icon: Youtube,
    },
    {
      key: "twitter",
      href: process.env.NEXT_PUBLIC_SOCIAL_TWITTER_X_URL,
      label: "إكس / تويتر",
      icon: Twitter,
    },
    {
      key: "instagram",
      href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL,
      label: "انستغرام",
      icon: Instagram,
    },
    {
      key: "tiktok",
      href: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK_URL,
      label: "تيك توك",
      icon: TiktokLogoLight,
    },
    {
      key: "snapchat",
      href: process.env.NEXT_PUBLIC_SOCIAL_SNAPCHAT_URL,
      label: "سناب شات",
      icon: RoundSnapchat,
    },
  ];
  return items.filter((item): item is typeof item & { href: string } => !!item.href);
}

export function SocialCard() {
  const socialLinks = getSocialLinks();
  if (socialLinks.length === 0) return null;

  return (
    <div
      role="complementary"
      aria-label="تابعنا على وسائل التواصل"
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm flex-none min-h-0 overflow-hidden p-3 flex flex-col gap-2"
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
