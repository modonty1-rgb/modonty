"use cache";

import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Linkedin } from "@/components/icons/linkedin";
import { Youtube } from "@/components/icons/youtube";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";
import type { ComponentType, SVGProps } from "react";

export type SocialLink = {
  key: string;
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const SOCIAL_CONFIG: { key: string; field: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { key: "facebook",  field: "facebookUrl",  label: "فيسبوك",      icon: SocialFacebookOutline },
  { key: "linkedin",  field: "linkedInUrl",  label: "لينكد إن",    icon: Linkedin },
  { key: "youtube",   field: "youtubeUrl",   label: "يوتيوب",      icon: Youtube },
  { key: "twitter",   field: "twitterUrl",   label: "إكس / تويتر", icon: Twitter },
  { key: "instagram", field: "instagramUrl", label: "انستغرام",    icon: Instagram },
  { key: "tiktok",    field: "tiktokUrl",    label: "تيك توك",     icon: TiktokLogoLight },
  { key: "snapchat",  field: "snapchatUrl",  label: "سناب شات",    icon: RoundSnapchat },
];

export async function getPlatformSocialLinks(): Promise<SocialLink[]> {
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
    .map(({ key, field, label, icon }) => ({
      key,
      href: (settings as Record<string, string | null>)[field] ?? "",
      label,
      icon,
    }))
    .filter(item => !!item.href);
}
