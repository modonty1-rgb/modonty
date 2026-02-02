#!/usr/bin/env node
/**
 * Seed Settings table with site/organization values from .env
 * Run: pnpm seed:settings
 */

const { PrismaClient } = require("@prisma/client");
const { readFileSync } = require("fs");
const { resolve } = require("path");

const envPath = resolve(__dirname, "../.env");

try {
  const envFile = readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
      process.env[key.trim()] = value;
    }
  });
} catch (error) {
  console.warn("Warning: Could not load .env file:", error);
}

const db = new PrismaClient();

function readSiteOrgFromEnv() {
  const lat = process.env.NEXT_PUBLIC_ORG_GEO_LATITUDE;
  const lng = process.env.NEXT_PUBLIC_ORG_GEO_LONGITUDE;
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || null,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || null,
    brandDescription: process.env.NEXT_PUBLIC_BRAND_DESCRIPTION?.trim() || null,
    siteAuthor: process.env.NEXT_PUBLIC_SITE_AUTHOR?.trim() || null,
    themeColor: process.env.NEXT_PUBLIC_THEME_COLOR?.trim() || null,
    twitterSite: process.env.NEXT_PUBLIC_TWITTER_SITE?.trim() || null,
    twitterCreator: process.env.NEXT_PUBLIC_TWITTER_CREATOR?.trim() || null,
    twitterSiteId: process.env.NEXT_PUBLIC_TWITTER_SITE_ID?.trim() || null,
    twitterCreatorId: process.env.NEXT_PUBLIC_TWITTER_CREATOR_ID?.trim() || null,
    orgContactType: process.env.NEXT_PUBLIC_ORG_CONTACT_TYPE?.trim() || null,
    orgContactEmail: process.env.NEXT_PUBLIC_ORG_CONTACT_EMAIL?.trim() || null,
    orgContactTelephone: process.env.NEXT_PUBLIC_ORG_CONTACT_TELEPHONE?.trim() || null,
    orgAreaServed: process.env.NEXT_PUBLIC_ORG_AREA_SERVED?.trim() || null,
    orgStreetAddress: process.env.NEXT_PUBLIC_ORG_STREET_ADDRESS?.trim() || null,
    orgAddressLocality: process.env.NEXT_PUBLIC_ORG_ADDRESS_LOCALITY?.trim() || null,
    orgAddressRegion: process.env.NEXT_PUBLIC_ORG_ADDRESS_REGION?.trim() || null,
    orgAddressCountry: process.env.NEXT_PUBLIC_ORG_ADDRESS_COUNTRY?.trim() || null,
    orgPostalCode: process.env.NEXT_PUBLIC_ORG_POSTAL_CODE?.trim() || null,
    orgGeoLatitude: lat != null && lat !== "" ? Number(lat) : null,
    orgGeoLongitude: lng != null && lng !== "" ? Number(lng) : null,
    orgSearchUrlTemplate: process.env.NEXT_PUBLIC_ORG_SEARCH_URL_TEMPLATE?.trim() || null,
    orgLogoUrl: process.env.NEXT_PUBLIC_ORG_LOGO_URL?.trim() || null,
  };
}

async function main() {
  console.log("🌱 Seeding Settings from .env...\n");

  const data = readSiteOrgFromEnv();

  console.log("📋 Site & Organization data from .env:");
  console.log(JSON.stringify(data, null, 2));
  console.log();

  const existing = await db.settings.findFirst();

  if (existing) {
    console.log(`✅ Found existing Settings record (id: ${existing.id}). Updating...`);
    await db.settings.update({
      where: { id: existing.id },
      data,
    });
    console.log("✅ Settings updated successfully!");
  } else {
    console.log("🆕 No Settings record found. Creating new one...");
    const newSettings = await db.settings.create({
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
        ...data,
      },
    });
    console.log(`✅ Settings created successfully (id: ${newSettings.id})!`);
  }

  console.log("\n✨ Done! Settings table now has site/org data from .env.");
  console.log("💡 .env is unchanged and remains the copy for other apps.\n");
}

main()
  .catch((error) => {
    console.error("❌ Error seeding settings:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
