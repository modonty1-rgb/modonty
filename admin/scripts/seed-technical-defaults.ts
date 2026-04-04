/**
 * Seed Technical Defaults — يُشغّل مرة واحدة
 *
 * يثبت القيم التقنية الثابتة في جدول Settings.
 * هذي قيم ما تتغير أبداً — مبنية على المصادر الرسمية:
 *
 * المصادر:
 * - WHATWG HTML Standard: charset must be UTF-8
 * - Google Search Central: robots default = index,follow; sitemap priority/changeFreq ignored
 * - Open Graph Protocol (ogp.me): og:type "website" is generic default
 * - Facebook Sharing Best Practices: OG image 1200x630
 * - X/Twitter Developer Docs: summary_large_image for content sites
 * - Google Search Central hreflang: ar-SA for Arabic Saudi
 * - OWASP: referrer-policy origin-when-cross-origin
 * - Google Chrome: notranslate = true for Arabic content
 *
 * التشغيل:
 *   npx tsx admin/scripts/seed-technical-defaults.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// القيم الثابتة — مبنية على المصادر الرسمية
const TECHNICAL_DEFAULTS = {
  // === ترميز الصفحة ===
  // WHATWG: "charset must be UTF-8" — لا يوجد بديل
  defaultCharset: "UTF-8",

  // === أوامر الروبوتات ===
  // Google Search Central: "default is index, follow — don't need to be specified"
  defaultMetaRobots: "index, follow",
  defaultGooglebot: "index, follow",

  // === Open Graph ===
  // ogp.me: "website" is the generic default type
  defaultOgType: "website",
  // Facebook: locale format = language_TERRITORY
  defaultOgLocale: "ar_SA",
  // ogp.me: determiner is optional, "auto" lets Facebook decide
  defaultOgDeterminer: "auto",

  // === OG Image ===
  // Facebook Sharing Best Practices: "at least 1200x630 for best display"
  defaultOgImageType: "image/webp",
  defaultOgImageWidth: 1200,
  defaultOgImageHeight: 630,

  // === Twitter/X Cards ===
  // X Developer Docs: summary_large_image = large image above text
  defaultTwitterCard: "summary_large_image",

  // === اللغة والمنطقة ===
  // Google Search Central hreflang: ISO 639-1 + ISO 3166-1 alpha-2
  defaultHreflang: "ar-SA",

  // === منع الترجمة ===
  // Google: notranslate prevents Chrome translation popup — essential for Arabic
  defaultNotranslate: true,

  // === سياسة الإحالة ===
  // OWASP + MDN: origin-when-cross-origin = good security default
  defaultReferrerPolicy: "origin-when-cross-origin",

  // === Sitemap ===
  // Google Search Central: "Google ignores priority and changefreq values"
  // نحطها لأن بعض crawlers الثانية ممكن تقرأها
  defaultSitemapPriority: 0.7,
  defaultSitemapChangeFreq: "weekly",
  articleDefaultSitemapPriority: 0.8,
  articleDefaultSitemapChangeFreq: "daily",

  // === ترخيص المحتوى ===
  defaultLicense: "https://creativecommons.org/licenses/by/4.0/",
  defaultIsAccessibleForFree: true,

  // === تقنية ===
  defaultPathname: "/",
  defaultTruncationSuffix: "…",
} as const;

// SEO Rules — industry consensus, stable 5+ years
const SEO_RULES = {
  seoTitleMin: 30,
  seoTitleMax: 60,
  seoTitleRestrict: false,
  seoDescriptionMin: 70,
  seoDescriptionMax: 160,
  seoDescriptionRestrict: false,
  twitterTitleMax: 70,
  twitterTitleRestrict: false,
  twitterDescriptionMax: 200,
  twitterDescriptionRestrict: false,
  ogTitleMax: 60,
  ogTitleRestrict: false,
  ogDescriptionMax: 200,
  ogDescriptionRestrict: false,
} as const;

// Business defaults — stable for 6+ months
const BUSINESS_DEFAULTS = {
  siteUrl: "https://modonty.com",
  siteName: "Modonty",
  siteAuthor: "Modonty Team",
  inLanguage: "ar-SA",
  orgAddressCountry: "SA",
  orgAreaServed: "SA",
  orgContactType: "customer service",
  orgContactAvailableLanguage: "ar, en",
  orgSearchUrlTemplate: "https://modonty.com/search?q={search_term_string}",
} as const;

const ALL_DEFAULTS = { ...SEO_RULES, ...TECHNICAL_DEFAULTS, ...BUSINESS_DEFAULTS };

async function main() {
  console.log("🔍 Checking current Settings...\n");

  const settings = await db.settings.findFirst();

  if (!settings) {
    console.log("❌ No Settings record found. Creating with all defaults...\n");
    await db.settings.create({ data: ALL_DEFAULTS });
    console.log("✅ Settings created with all defaults.\n");
    return;
  }

  // Compare current values with correct values
  console.log("📋 Comparing current values with defaults:\n");

  type AllKey = keyof typeof ALL_DEFAULTS;
  const keys = Object.keys(ALL_DEFAULTS) as AllKey[];
  const updates: Record<string, unknown> = {};
  let changesNeeded = 0;

  for (const key of keys) {
    const current = (settings as Record<string, unknown>)[key];
    const correct = ALL_DEFAULTS[key];
    const match = current === correct;

    if (match) {
      console.log(`  ✅ ${key}: ${String(current)}`);
    } else {
      console.log(`  ⚠️  ${key}: ${String(current ?? "null")} → ${String(correct)}`);
      updates[key] = correct;
      changesNeeded++;
    }
  }

  if (changesNeeded === 0) {
    console.log("\n✅ All technical defaults are already correct. Nothing to update.\n");
    return;
  }

  console.log(`\n📝 Updating ${changesNeeded} field(s)...\n`);

  await db.settings.update({
    where: { id: settings.id },
    data: updates,
  });

  console.log(`✅ Done. ${changesNeeded} field(s) updated to best-practice values.\n`);

  // Verify
  const updated = await db.settings.findFirst();
  console.log("🔍 Verification — updated values:\n");
  for (const key of keys) {
    const val = (updated as Record<string, unknown>)?.[key];
    const correct = ALL_DEFAULTS[key];
    const ok = val === correct;
    console.log(`  ${ok ? "✅" : "❌"} ${key}: ${String(val)}`);
  }
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
