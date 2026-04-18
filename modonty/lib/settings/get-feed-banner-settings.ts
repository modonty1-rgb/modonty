import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

interface FeedBannerSettings {
  platformTagline: string | null;
  platformDescription: string | null;
}

export const getFeedBannerSettings = unstable_cache(
  async (): Promise<FeedBannerSettings> => {
    const settings = await db.settings.findFirst();
    if (!settings) return { platformTagline: null, platformDescription: null };
    const raw = settings as unknown as Record<string, unknown>;
    return {
      platformTagline: (raw.platformTagline as string | null | undefined) ?? null,
      platformDescription: (raw.platformDescription as string | null | undefined) ?? null,
    };
  },
  ["feed-banner-settings"],
  { tags: ["settings"], revalidate: 3600 }
);
