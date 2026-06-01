"use server";

import { db } from "@/lib/db";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { generateClientSEO } from "@/app/(dashboard)/clients/actions/clients-actions/generate-client-seo";
import { generateAndSaveCategorySeo } from "@/lib/seo/category-seo-generator";
import { generateAndSaveTagSeo } from "@/lib/seo/tag-seo-generator";
import { generateAndSaveIndustrySeo } from "@/lib/seo/industry-seo-generator";
import { regenerateNextjsMetadata } from "@/lib/seo/metadata-storage";
import { regenerateJsonLd } from "@/lib/seo/jsonld-storage";

/**
 * Canonical URL sanitizer (site-wide: clients · articles · categories · tags · industries · authors).
 *
 * Reason: old generators left some `canonicalUrl` columns with the WRONG host
 * (e.g. non-www while the site serves www) or DOUBLE-ENCODED Arabic slugs (`%25D8…`).
 * A wrong canonical splits ranking signals / confuses Google's indexer.
 *
 * Source of truth for the correct host = `Settings.siteUrl` (Advanced settings).
 * This tool re-derives every canonical as `{siteUrl-origin}/{path}/{slug}` (matching
 * the generators' own convention — raw slug), fixes the stored column, then REGENERATES
 * that entity's stored SEO (nextjsMetadata / jsonLd) so the live page reflects the fix.
 *
 * Null columns are left alone — the generators build the canonical from `siteUrl` for
 * those, and a global Settings "Save & Publish" cascade refreshes them.
 */

type EntityKind = "client" | "article" | "category" | "tag" | "industry" | "author";

interface EntityConfig {
  kind: EntityKind;
  path: string; // public route segment, e.g. "clients"
  regen?: (id: string) => Promise<unknown>; // undefined = column-only (no SEO generator)
}

// Author has no SEO generator (its page builds canonical at runtime) → column-only fix.
const ENTITIES: EntityConfig[] = [
  { kind: "client", path: "clients", regen: (id) => generateClientSEO(id) },
  {
    kind: "article",
    path: "articles",
    regen: async (id) => {
      await regenerateNextjsMetadata(id).catch(() => {});
      await regenerateJsonLd(id).catch(() => {});
    },
  },
  { kind: "category", path: "categories", regen: (id) => generateAndSaveCategorySeo(id) },
  { kind: "tag", path: "tags", regen: (id) => generateAndSaveTagSeo(id) },
  { kind: "industry", path: "industries", regen: (id) => generateAndSaveIndustrySeo(id) },
  { kind: "author", path: "authors" }, // column-only
];

export interface CanonicalIssue {
  kind: EntityKind;
  id: string;
  slug: string;
  before: string;
  after: string;
}

export interface CanonicalSanitizerStats {
  expectedOrigin: string;
  totalChecked: number;
  okOrNull: number;
  issueCount: number;
  issues: CanonicalIssue[];
}

export interface CanonicalSanitizerResult {
  attempted: number;
  successful: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** A stored canonical is "bad" when host differs, it's double-encoded, or the path drifted. */
function isBadCanonical(stored: string | null | undefined, correct: string, expectedOrigin: string): boolean {
  const v = (stored ?? "").trim();
  if (!v) return false; // null/empty → generator fills it from siteUrl; not this tool's job
  if (v.includes("%25")) return true; // double-encoded (e.g. %25D8%25A7)
  let storedUrl: URL;
  try {
    storedUrl = new URL(v);
  } catch {
    return true; // unparseable → fix
  }
  if (storedUrl.origin !== expectedOrigin) return true; // wrong host (www mismatch, etc.)
  const correctUrl = new URL(correct);
  return safeDecode(storedUrl.pathname) !== safeDecode(correctUrl.pathname); // wrong path
}

async function resolveExpectedOrigin(): Promise<string | null> {
  const settings = await db.settings.findFirst({ select: { siteUrl: true } });
  const raw = settings?.siteUrl || (await loadSiteUrl());
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

async function loadRows(kind: EntityKind): Promise<Array<{ id: string; slug: string; canonicalUrl: string | null }>> {
  const select = { id: true, slug: true, canonicalUrl: true };
  switch (kind) {
    case "client":
      return db.client.findMany({ select });
    case "article":
      return db.article.findMany({ select });
    case "category":
      return db.category.findMany({ select });
    case "tag":
      return db.tag.findMany({ select });
    case "industry":
      return db.industry.findMany({ select });
    case "author":
      return db.author.findMany({ select });
  }
}

async function updateCanonical(kind: EntityKind, id: string, value: string): Promise<void> {
  const data = { canonicalUrl: value };
  switch (kind) {
    case "client":
      await db.client.update({ where: { id }, data });
      return;
    case "article":
      await db.article.update({ where: { id }, data });
      return;
    case "category":
      await db.category.update({ where: { id }, data });
      return;
    case "tag":
      await db.tag.update({ where: { id }, data });
      return;
    case "industry":
      await db.industry.update({ where: { id }, data });
      return;
    case "author":
      await db.author.update({ where: { id }, data });
      return;
  }
}

export async function getCanonicalSanitizerStats(): Promise<CanonicalSanitizerStats> {
  const expectedOrigin = await resolveExpectedOrigin();
  if (!expectedOrigin) {
    return { expectedOrigin: "", totalChecked: 0, okOrNull: 0, issueCount: 0, issues: [] };
  }

  const issues: CanonicalIssue[] = [];
  let totalChecked = 0;
  let okOrNull = 0;

  for (const entity of ENTITIES) {
    const rows = await loadRows(entity.kind);
    for (const row of rows) {
      if (!row.slug) continue;
      totalChecked++;
      const correct = `${expectedOrigin}/${entity.path}/${row.slug}`;
      if (isBadCanonical(row.canonicalUrl, correct, expectedOrigin)) {
        issues.push({ kind: entity.kind, id: row.id, slug: row.slug, before: row.canonicalUrl ?? "", after: correct });
      } else {
        okOrNull++;
      }
    }
  }

  return { expectedOrigin, totalChecked, okOrNull, issueCount: issues.length, issues };
}

export async function sanitizeAllCanonicals(): Promise<CanonicalSanitizerResult> {
  const stats = await getCanonicalSanitizerStats();
  const regenByKind = new Map(ENTITIES.map((e) => [e.kind, e.regen]));
  const result: CanonicalSanitizerResult = { attempted: stats.issues.length, successful: 0, failed: 0, errors: [] };

  for (const issue of stats.issues) {
    try {
      await updateCanonical(issue.kind, issue.id, issue.after);
      // Regenerate stored SEO so the live page reflects the corrected canonical.
      const regen = regenByKind.get(issue.kind);
      if (regen) await regen(issue.id).catch(() => {});
      result.successful++;
    } catch (e) {
      result.failed++;
      result.errors.push({ id: issue.id, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return result;
}
