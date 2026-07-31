/**
 * Plain constants for the Cloudinary → Bunny migration.
 *
 * They live OUTSIDE the `"use server"` file on purpose: a server-action module may only
 * export async functions. Exporting an array from there turns it into an action proxy on
 * the client, which fails at runtime with "function is not iterable" the moment you map
 * over it (hit 2026-07-30).
 */

export type MigrationScope =
  | "media"
  | "danglingLinks"
  | "orphans"
  | "raw"
  | "articles"
  | "clients"
  | "categories"
  | "tags"
  | "industries"
  | "authors"
  | "modontyPages"
  | "listings";

/**
 * Fixed execution order — regenerating before the raw swap re-bakes Cloudinary URLs.
 *
 * `authors` and `modontyPages` were missing until 2026-07-31. Their rows carry their own
 * cached SEO (`jsonLdStructuredData` / `metaTags`), so the raw swap alone left them baked
 * with the retired Cloudinary logo: six legal/about pages and the platform author still
 * emitted it long after `Settings.logoUrl` had moved to Bunny. A scope that detects a
 * cache but cannot rebuild it is a dead end — every regenerable entity needs one here.
 */
export const SCOPE_ORDER: MigrationScope[] = [
  "media",
  "danglingLinks",
  "orphans",
  "raw",
  "articles",
  "clients",
  "categories",
  "tags",
  "industries",
  "authors",
  "modontyPages",
  "listings",
];

export const SCOPE_LABEL: Record<MigrationScope, string> = {
  media: "Migrate Media rows to Bunny",
  danglingLinks: "Delete dangling link rows",
  orphans: "Re-host orphan URLs",
  raw: "Swap raw fields",
  articles: "Regenerate articles",
  clients: "Regenerate clients",
  categories: "Regenerate categories",
  tags: "Regenerate tags",
  industries: "Regenerate industries",
  authors: "Regenerate authors",
  modontyPages: "Regenerate Modonty pages",
  listings: "Regenerate listing pages",
};
