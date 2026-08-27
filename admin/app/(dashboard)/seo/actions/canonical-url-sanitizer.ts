"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit/log-action";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { PAGE_CONFIGS } from "@/app/(dashboard)/modonty/setting/helpers/page-config";

/**
 * Canonical URL Sanitizer — full repo coverage
 *
 * Detects + fixes canonical URLs with stale hosts across 7 entity tables:
 *   1. Article    → /articles/{slug}
 *   2. Client     → /clients/{slug}
 *   3. Category   → /categories/{slug}
 *   4. Tag        → /tags/{slug}
 *   5. Industry   → /industries/{slug}
 *   6. Author     → /authors/{slug}
 *   7. Modonty    → {modontyPath from PAGE_CONFIGS}
 *
 * Source of truth: Settings.siteUrl (DB) via loadSiteUrl semantics.
 * Used by:
 *   - Auto-Maintenance "Canonical URLs" step on /database (Run-All)
 */

/**
 * What a stored canonical needs — never "overwrite it with the self-referential URL",
 * which is what this file used to do to EVERY value that differed.
 *
 * Google's canonical spec (developers.google.com/search/docs/crawling-indexing/
 * consolidate-duplicate-urls) is explicit that the primary use of rel=canonical is a
 * duplicate page pointing at a DIFFERENT page, and that a self-referential canonical is
 * recommended, not required. So a canonical whose path is not this page's path can be a
 * deliberate decision — and rewriting it silently re-indexes content we chose to fold.
 * The only thing this sanitizer owns is the ORIGIN (scheme + host + port).
 */
export type CanonicalFix =
  /** Origin and path both correct — nothing to write. */
  | "ok"
  /** Same site wearing the wrong origin (apex vs www, http, a dev host). Swap origin, keep path. */
  | "rehost"
  /** Stored as a bare path ("/articles/x"). Resolve against the right origin, keep path. */
  | "resolve"
  /** Path points at nothing that exists here (renamed slug, deleted page). Fall back to self. */
  | "reset"
  /** Points at another site — cross-domain canonicals are legal and deliberate. Never touched. */
  | "external";

export interface CanonicalSample {
  id: string;
  slug: string;
  title: string;
  entity: EntityType;
  before: string;
  after: string;
  fix: CanonicalFix;
  reason?: string;
}

export type EntityType =
  | "article"
  | "client"
  | "category"
  | "tag"
  | "industry"
  | "author"
  | "modonty";

export interface CanonicalSanitizerStats {
  total: number;
  withCanonical: number;
  staleCount: number;
  expectedBase: string | null;
  detectedBadHosts: string[];
  sample: CanonicalSample[];
  perEntity: Record<EntityType, { total: number; stale: number }>;
}

interface EntityConfig {
  type: EntityType;
  buildPath: (slug: string) => string;
}

const ENTITIES: Record<EntityType, EntityConfig> = {
  article: { type: "article", buildPath: (slug) => `/articles/${slug}` },
  client: { type: "client", buildPath: (slug) => `/clients/${slug}` },
  category: { type: "category", buildPath: (slug) => `/categories/${slug}` },
  tag: { type: "tag", buildPath: (slug) => `/tags/${slug}` },
  industry: { type: "industry", buildPath: (slug) => `/industries/${slug}` },
  author: { type: "author", buildPath: (slug) => `/authors/${slug}` },
  modonty: {
    type: "modonty",
    buildPath: (slug) => {
      const cfg = PAGE_CONFIGS.find((c) => c.slug === slug);
      return cfg?.modontyPath ?? `/${slug}`;
    },
  },
};

function buildExpectedCanonical(path: string, baseUrl: string): string {
  // Use the same construction as modonty's runtime canonical generator —
  // `new URL` percent-encodes Arabic + path separators correctly.
  return new URL(path, baseUrl).href;
}

/** Hosts that only ever exist by accident — a dev machine or a preview deploy leaking into the DB. */
function isDevHost(host: string): boolean {
  const hostname = host.split(":")[0];
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".vercel.app")
  );
}

/** www.modonty.com and modonty.com are the same site — compare on the apex. */
function apexOf(host: string): string {
  return host.split(":")[0].replace(/^www\./, "");
}

interface CanonicalPlan {
  fix: CanonicalFix;
  /** The value to write. Null whenever nothing should be written. */
  after: string | null;
  reason?: string;
}

/**
 * Decide what (if anything) a stored canonical needs.
 *
 * `knownPaths` is every canonical path this site legitimately serves, so a canonical that
 * points at ANOTHER of our pages is recognised as an intentional duplicate-consolidation
 * and left alone — while one pointing at a path that no longer exists (renamed slug,
 * deleted page) is correctly reset. Without that set the two are indistinguishable.
 */
function planCanonicalFix(
  stored: string,
  expectedSelf: string,
  base: URL,
  knownPaths: ReadonlySet<string>,
): CanonicalPlan {
  let url: URL;
  try {
    url = new URL(stored);
  } catch {
    // Not absolute. A bare "/articles/x" still carries real intent — keep the path and
    // only supply the origin it was missing.
    if (stored.startsWith("/")) {
      try {
        return { fix: "resolve", after: new URL(stored, base).href, reason: "relative" };
      } catch {
        // fall through to reset
      }
    }
    return { fix: "reset", after: expectedSelf, reason: "malformed" };
  }

  const sameSite = isDevHost(url.host) || apexOf(url.host) === apexOf(base.host);
  if (!sameSite) {
    // Cross-domain canonical (syndicated content pointing at the original publisher).
    // Google supports these; overwriting one would be us deleting somebody's decision.
    return { fix: "external", after: null, reason: url.host };
  }

  const selfPath = new URL(expectedSelf).pathname;
  const targetPath = url.pathname;
  const pointsSomewhereReal = targetPath === selfPath || knownPaths.has(targetPath);

  if (!pointsSomewhereReal) {
    // Nothing on this site answers that path — a slug rename or a deleted page left the
    // canonical pointing into the void, which is worse than no canonical at all.
    return { fix: "reset", after: expectedSelf, reason: `dead path ${targetPath}` };
  }

  if (url.origin === base.origin) return { fix: "ok", after: null };

  // Right page, wrong coat. Rebuild from base.origin rather than mutating url.host —
  // the host setter keeps a stale port (":3000") when the new value carries none.
  return {
    fix: "rehost",
    after: `${base.origin}${url.pathname}${url.search}${url.hash}`,
    reason: url.host,
  };
}

interface EntityRow {
  id: string;
  slug: string;
  title: string;
  canonicalUrl: string | null;
}

async function fetchAllEntities(): Promise<Record<EntityType, EntityRow[]>> {
  const [articles, clients, categories, tags, industries, authors, modontyPages] =
    await Promise.all([
      db.article.findMany({
        // Include ALL statuses — DRAFT/SCHEDULED articles also have canonicalUrl
        // that drives the Quality Check pre-publish gate.
        select: { id: true, slug: true, title: true, canonicalUrl: true },
      }),
      db.client.findMany({
        select: { id: true, slug: true, name: true, canonicalUrl: true },
      }),
      db.category.findMany({
        select: { id: true, slug: true, name: true, canonicalUrl: true },
      }),
      db.tag.findMany({
        select: { id: true, slug: true, name: true, canonicalUrl: true },
      }),
      db.industry.findMany({
        select: { id: true, slug: true, name: true, canonicalUrl: true },
      }),
      db.author.findMany({
        select: { id: true, slug: true, name: true, canonicalUrl: true },
      }),
      db.modonty.findMany({
        select: { id: true, slug: true, title: true, canonicalUrl: true },
      }),
    ]);

  return {
    article: articles,
    client: clients.map((c) => ({ id: c.id, slug: c.slug, title: c.name, canonicalUrl: c.canonicalUrl })),
    category: categories.map((c) => ({ id: c.id, slug: c.slug, title: c.name, canonicalUrl: c.canonicalUrl })),
    tag: tags.map((t) => ({ id: t.id, slug: t.slug, title: t.name, canonicalUrl: t.canonicalUrl })),
    industry: industries.map((i) => ({ id: i.id, slug: i.slug, title: i.name, canonicalUrl: i.canonicalUrl })),
    author: authors.map((a) => ({ id: a.id, slug: a.slug, title: a.name, canonicalUrl: a.canonicalUrl })),
    modonty: modontyPages,
  };
}

interface PlannedChange {
  entity: EntityType;
  row: EntityRow;
  plan: CanonicalPlan;
}

/**
 * One pass over every entity: collect the paths this site really serves, then plan each
 * stored canonical against them. The stats card and the fixer both read from here, so the
 * number the admin is shown and the rows the fixer writes can never disagree.
 */
async function planAllCanonicals(base: URL): Promise<{
  all: Record<EntityType, EntityRow[]>;
  changes: PlannedChange[];
  withCanonical: number;
  total: number;
}> {
  const all = await fetchAllEntities();

  const knownPaths = new Set<string>();
  for (const entityType of Object.keys(all) as EntityType[]) {
    for (const row of all[entityType]) {
      knownPaths.add(new URL(ENTITIES[entityType].buildPath(row.slug), base).pathname);
    }
  }

  const changes: PlannedChange[] = [];
  let withCanonical = 0;
  let total = 0;

  for (const entityType of Object.keys(all) as EntityType[]) {
    const rows = all[entityType];
    total += rows.length;

    for (const row of rows) {
      if (!row.canonicalUrl) continue;
      withCanonical++;

      const expectedSelf = buildExpectedCanonical(
        ENTITIES[entityType].buildPath(row.slug),
        base.href,
      );
      const plan = planCanonicalFix(row.canonicalUrl, expectedSelf, base, knownPaths);
      if (plan.after !== null && plan.after !== row.canonicalUrl) {
        changes.push({ entity: entityType, row, plan });
      }
    }
  }

  return { all, changes, withCanonical, total };
}

export async function getCanonicalUrlSanitizerStats(): Promise<CanonicalSanitizerStats> {
  const settings = await getAllSettings();
  const expectedSiteUrl = settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? null;

  const emptyPerEntity: Record<EntityType, { total: number; stale: number }> = {
    article: { total: 0, stale: 0 },
    client: { total: 0, stale: 0 },
    category: { total: 0, stale: 0 },
    tag: { total: 0, stale: 0 },
    industry: { total: 0, stale: 0 },
    author: { total: 0, stale: 0 },
    modonty: { total: 0, stale: 0 },
  };

  if (!expectedSiteUrl) {
    return {
      total: 0,
      withCanonical: 0,
      staleCount: 0,
      expectedBase: null,
      detectedBadHosts: [],
      sample: [],
      perEntity: emptyPerEntity,
    };
  }

  let base: URL;
  try {
    base = new URL(expectedSiteUrl);
  } catch {
    // A malformed Settings.siteUrl must not become the yardstick every canonical is
    // measured against — report nothing rather than rewrite everything against garbage.
    return {
      total: 0,
      withCanonical: 0,
      staleCount: 0,
      expectedBase: null,
      detectedBadHosts: [],
      sample: [],
      perEntity: emptyPerEntity,
    };
  }

  const { all, changes, withCanonical, total } = await planAllCanonicals(base);

  const perEntity = emptyPerEntity;
  for (const entityType of Object.keys(all) as EntityType[]) {
    perEntity[entityType].total = all[entityType].length;
  }
  for (const change of changes) perEntity[change.entity].stale++;

  const badHosts = new Set<string>();
  for (const change of changes) {
    if (change.plan.reason) badHosts.add(change.plan.reason);
  }

  return {
    total,
    withCanonical,
    staleCount: changes.length,
    expectedBase: expectedSiteUrl,
    detectedBadHosts: Array.from(badHosts).slice(0, 5),
    sample: changes.slice(0, 10).map((c) => ({
      id: c.row.id,
      slug: c.row.slug,
      title: c.row.title,
      entity: c.entity,
      before: c.row.canonicalUrl ?? "",
      after: c.plan.after ?? "",
      fix: c.plan.fix,
      reason: c.plan.reason,
    })),
    perEntity,
  };
}

// `regenerateAllStaleCanonicalUrls` was deleted on 27 Aug 2026. It wrote seven canonicalUrl
// columns and stopped: no SEO regeneration, no modonty cache bust. modonty serves the STORED
// blob, so its corrections never reached a public page while the maintenance panel counted
// them as successes. The one sanitizer left is `sanitizeAllCanonicals` in
// database/actions/canonical-sanitizer.ts, which rebuilds the blob after the column and
// counts a failed rebuild as a failure. The read-only `getCanonicalUrlSanitizerStats` above
// stays — it is what the SEO panel displays.
