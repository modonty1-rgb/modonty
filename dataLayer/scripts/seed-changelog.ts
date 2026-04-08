/**
 * One-time seed: Add all admin changelog entries to DB
 * Run: cd dataLayer && npx tsx scripts/seed-changelog.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const entries = [
  {
    version: "v0.9.0",
    title: "Media Library Overhaul",
    items: [
      { type: "feature" as const, text: "Media: full redesign with image SEO fields" },
      { type: "feature" as const, text: "EXIF data extraction on upload" },
      { type: "feature" as const, text: "Media entries in sitemap" },
    ],
  },
  {
    version: "v0.10.0",
    title: "Authors Overhaul",
    items: [
      { type: "improve" as const, text: "Authors: full overhaul with Person JSON-LD" },
      { type: "feature" as const, text: "Author cascade to articles SEO" },
    ],
  },
  {
    version: "v0.11.0",
    title: "Clients Security & SEO",
    items: [
      { type: "feature" as const, text: "Clients: auth + Zod security on all actions" },
      { type: "feature" as const, text: "Organization JSON-LD for each client" },
      { type: "improve" as const, text: "Client form UI overhaul" },
    ],
  },
  {
    version: "v0.12.0",
    title: "Articles Editor Upgrade",
    items: [
      { type: "feature" as const, text: "Articles: 5-step form with auto-save" },
      { type: "feature" as const, text: "Rich text editor upgrade" },
      { type: "feature" as const, text: "Publish gate: SEO score must pass before publish" },
      { type: "fix" as const, text: "Optimistic lock race condition fixed" },
    ],
  },
  {
    version: "v0.13.0",
    title: "Security + Feedback System",
    items: [
      { type: "feature" as const, text: "Auth + Zod on categories, tags, industries" },
      { type: "feature" as const, text: "Feedback banner: Send Note → DB + email" },
      { type: "improve" as const, text: "Client form labels: Arabic → English" },
    ],
  },
  {
    version: "v0.14.0",
    title: "Auth Coverage + Industry Cascade",
    items: [
      { type: "feature" as const, text: "Auth added to authors, media, settings actions" },
      { type: "feature" as const, text: "Industry change cascades to all linked clients" },
    ],
  },
  {
    version: "v0.15.0",
    title: "Toast + SEO + UI Polish",
    items: [
      { type: "improve" as const, text: "Toast messages: Arabic + icons + colors + auto-dismiss" },
      { type: "fix" as const, text: "SEO progress counter fixed (56% → 60%)" },
      { type: "improve" as const, text: "Arabic tooltips + SEO analyzer messages" },
    ],
  },
  {
    version: "v0.16.0",
    title: "Changelog + Team Notes",
    items: [
      { type: "feature" as const, text: "Changelog page with version history" },
      { type: "feature" as const, text: "Team notes with replies + time emojis" },
    ],
  },
  {
    version: "v0.17.0",
    title: "Settings Cascade to All Entities",
    items: [
      { type: "feature" as const, text: "Save settings → auto-cascade SEO to all entities" },
      { type: "feature" as const, text: "About + Legal pages with cached metadata" },
    ],
  },
  {
    version: "v0.18.0",
    title: "Status Transitions + Error UX",
    items: [
      { type: "improve" as const, text: "Article status: open transitions between all states" },
      { type: "improve" as const, text: "Error toast display time increased to 10s" },
    ],
  },
  {
    version: "v0.19.0",
    title: "Arabic Media Upload Fix",
    items: [
      { type: "fix" as const, text: "Safe ASCII filenames for media uploaded with Arabic names" },
      { type: "fix" as const, text: "Arabic alt text saved to DB correctly for SEO" },
    ],
  },
  {
    version: "v0.20.0",
    title: "Bulk SEO + Auth + Slug",
    items: [
      { type: "feature" as const, text: "Bulk SEO fix for low-score articles in SEO Overview" },
      { type: "feature" as const, text: "Terms page: cached metadata" },
      { type: "feature" as const, text: "Slug box visible on all entity forms" },
      { type: "feature" as const, text: "Auth on user management actions" },
    ],
  },
  {
    version: "v0.21.0",
    title: "Client Form UX Overhaul",
    items: [
      { type: "improve" as const, text: "Client form: full UX overhaul with accordion sections" },
      { type: "fix" as const, text: "Slug uniqueness validation before save" },
      { type: "improve" as const, text: "Arabic field hints added throughout" },
      { type: "improve" as const, text: "Real pricing tiers integrated" },
    ],
  },
  {
    version: "v0.22.0",
    title: "Message Centralization",
    items: [
      { type: "improve" as const, text: "All toast descriptions centralized in messages.ts" },
      { type: "improve" as const, text: "All form hints centralized — no hardcoded strings" },
    ],
  },
  {
    version: "v0.23.0",
    title: "Clients Table + Settings Restructure",
    items: [
      { type: "improve" as const, text: "Clients table: full UX overhaul with status badges" },
      { type: "improve" as const, text: "Settings page restructured into tabbed layout" },
    ],
  },
  {
    version: "v0.24.0",
    title: "Cache Chain Fix + SEO UX",
    items: [
      { type: "fix" as const, text: "REVALIDATE_SECRET: admin now correctly busts modonty cache after save" },
      { type: "improve" as const, text: "SEO Description fields changed to textarea (multiline)" },
      { type: "fix" as const, text: "regenerateHomePageCache and regenerateAllListingCaches now call revalidateModontyTag" },
    ],
  },
  {
    version: "v0.25.0",
    title: "Listing Pages OG Image",
    items: [
      { type: "feature" as const, text: "Clients, Categories, Trending pages: OG image + twitter:card added to metadata" },
      { type: "feature" as const, text: "Settings: Social Sharing Image preview shown in each listing page tab" },
      { type: "improve" as const, text: "Tags, Industries, Articles cache pre-populated — ready for future modonty pages" },
    ],
  },
];

async function main() {
  console.log(`Seeding ${entries.length} changelog entries...`);

  // Clear existing (dev only)
  await db.changelog.deleteMany({});
  console.log("Cleared existing entries.");

  for (const entry of entries) {
    await db.changelog.create({ data: entry });
    console.log(`✅ ${entry.version}: ${entry.title}`);
  }

  console.log("\nDone! All changelog entries seeded.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
