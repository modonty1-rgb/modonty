import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export interface HomePageSeo {
  metadata: Metadata | null;
  jsonLd: string | null;
}

export async function getHomePageSeo(): Promise<HomePageSeo> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  const settings = await db.settings.findFirst({
    select: {
      homeMetaTags: true,
      jsonLdStructuredData: true,
    },
  });

  if (!settings) {
    return { metadata: null, jsonLd: null };
  }

  const raw = settings.homeMetaTags as Record<string, unknown> | null;
  const { viewport: _v, themeColor: _t, ...metaOnly } = raw ?? {};
  const metadata = (Object.keys(metaOnly).length ? metaOnly : null) as Metadata | null;

  const rawJsonLd = settings.jsonLdStructuredData;
  const jsonLd =
    typeof rawJsonLd === "string" && rawJsonLd.trim().length > 0
      ? rawJsonLd
      : null;

  return { metadata, jsonLd };
}


