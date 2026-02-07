#!/usr/bin/env tsx
/**
 * Fill Settings table with default SEO default values (Section 6 — HARDCODED-DEFAULTS.md).
 * Run: pnpm seed:seo-defaults (from admin) or cd admin && pnpm seed:seo-defaults
 * Creates Settings record if missing; updates only null default* fields.
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SEO_DEFAULTS = {
  defaultMetaRobots: "index, follow",
  defaultGooglebot: "index, follow",
  defaultOgType: "website",
  defaultOgLocale: "ar_SA",
  defaultOgDeterminer: "auto",
  defaultTwitterCard: "summary_large_image",
  defaultSitemapPriority: 0.5,
  defaultSitemapChangeFreq: "monthly",
  defaultCharset: "UTF-8",
  defaultOgImageType: "image/jpeg",
  defaultOgImageWidth: 1200,
  defaultOgImageHeight: 630,
  defaultHreflang: "x-default",
  defaultPathname: "/",
  defaultTruncationSuffix: "...",
} as const;

async function main() {
  console.log("🌱 Filling Settings SEO defaults...\n");

  const existing = await db.settings.findFirst();

  if (existing) {
    const updates: Partial<typeof SEO_DEFAULTS> = {};
    const current = existing as Record<string, unknown>;
    for (const [key, value] of Object.entries(SEO_DEFAULTS)) {
      if (current[key] == null) {
        (updates as Record<string, unknown>)[key] = value;
      }
    }
    if (Object.keys(updates).length === 0) {
      console.log("✅ All SEO default fields already set. Nothing to update.");
      return;
    }
    await db.settings.update({
      where: { id: existing.id },
      data: updates,
    });
    console.log("✅ Updated Settings with defaults:", Object.keys(updates).join(", "));
  } else {
    const created = await db.settings.create({
      data: {
        seoTitleMin: 30,
        seoTitleMax: 60,
        seoTitleRestrict: false,
        seoDescriptionMin: 120,
        seoDescriptionMax: 160,
        seoDescriptionRestrict: false,
        twitterTitleMax: 70,
        twitterTitleRestrict: true,
        twitterDescriptionMax: 200,
        twitterDescriptionRestrict: true,
        ogTitleMax: 60,
        ogTitleRestrict: false,
        ogDescriptionMax: 200,
        ogDescriptionRestrict: false,
        gtmContainerId: null,
        gtmEnabled: false,
        hotjarSiteId: null,
        hotjarEnabled: false,
        facebookUrl: null,
        twitterUrl: null,
        linkedInUrl: null,
        instagramUrl: null,
        youtubeUrl: null,
        tiktokUrl: null,
        pinterestUrl: null,
        snapchatUrl: null,
        ...SEO_DEFAULTS,
      },
    });
    console.log(`✅ Settings created with SEO defaults (id: ${created.id}).`);
  }

  console.log("\n📋 SEO defaults applied:", SEO_DEFAULTS);
  console.log("\n✨ Done.\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
