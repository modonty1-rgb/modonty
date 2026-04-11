"use cache";

import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

export type SocialLink = {
  key: string;
  href: string;
  label: string;
};

const SOCIAL_FIELDS: { key: string; field: string; label: string }[] = [
  { key: "facebook",  field: "facebookUrl",  label: "فيسبوك"      },
  { key: "linkedin",  field: "linkedInUrl",  label: "لينكد إن"    },
  { key: "youtube",   field: "youtubeUrl",   label: "يوتيوب"      },
  { key: "twitter",   field: "twitterUrl",   label: "إكس / تويتر" },
  { key: "instagram", field: "instagramUrl", label: "انستغرام"    },
  { key: "tiktok",    field: "tiktokUrl",    label: "تيك توك"     },
  { key: "snapchat",  field: "snapchatUrl",  label: "سناب شات"    },
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

  return SOCIAL_FIELDS
    .map(({ key, field, label }) => ({
      key,
      href: (settings as Record<string, string | null>)[field] ?? "",
      label,
    }))
    .filter(item => !!item.href);
}
