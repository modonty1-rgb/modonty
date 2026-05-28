"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
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

export interface CanonicalSample {
  id: string;
  slug: string;
  title: string;
  entity: EntityType;
  before: string;
  after: string;
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

const BAD_HOST_PATTERNS = [
  "http://localhost",
  "https://localhost",
  "127.0.0.1",
  "0.0.0.0",
  ".vercel.app",
];

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

function detectStaleCanonical(
  stored: string,
  expected: string,
  expectedSiteUrl: string,
): { stale: boolean; badHost?: string } {
  if (stored !== expected) {
    for (const pattern of BAD_HOST_PATTERNS) {
      if (stored.includes(pattern)) return { stale: true, badHost: pattern };
    }
    try {
      const expectedHost = new URL(expectedSiteUrl).host;
      const storedHost = new URL(stored).host;
      if (storedHost !== expectedHost) return { stale: true, badHost: storedHost };
    } catch {
      return { stale: true, badHost: "malformed" };
    }
    return { stale: true };
  }
  return { stale: false };
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

  const all = await fetchAllEntities();
  const stale: CanonicalSample[] = [];
  const badHosts = new Set<string>();
  const perEntity = emptyPerEntity;
  let total = 0;
  let withCanonical = 0;

  for (const entityType of Object.keys(all) as EntityType[]) {
    const rows = all[entityType];
    const cfg = ENTITIES[entityType];
    perEntity[entityType].total = rows.length;
    total += rows.length;

    for (const row of rows) {
      if (!row.canonicalUrl) continue;
      withCanonical++;

      const expected = buildExpectedCanonical(cfg.buildPath(row.slug), expectedSiteUrl);
      const check = detectStaleCanonical(row.canonicalUrl, expected, expectedSiteUrl);

      if (check.stale) {
        if (check.badHost) badHosts.add(check.badHost);
        perEntity[entityType].stale++;
        stale.push({
          id: row.id,
          slug: row.slug,
          title: row.title,
          entity: entityType,
          before: row.canonicalUrl,
          after: expected,
        });
      }
    }
  }

  return {
    total,
    withCanonical,
    staleCount: stale.length,
    expectedBase: expectedSiteUrl,
    detectedBadHosts: Array.from(badHosts).slice(0, 5),
    sample: stale.slice(0, 10),
    perEntity,
  };
}

export async function regenerateAllStaleCanonicalUrls(): Promise<{
  attempted: number;
  successful: number;
  failed: number;
  perEntity: Record<EntityType, { attempted: number; successful: number; failed: number }>;
}> {
  const stats = await getCanonicalUrlSanitizerStats();
  const emptyPerEntity: Record<EntityType, { attempted: number; successful: number; failed: number }> = {
    article: { attempted: 0, successful: 0, failed: 0 },
    client: { attempted: 0, successful: 0, failed: 0 },
    category: { attempted: 0, successful: 0, failed: 0 },
    tag: { attempted: 0, successful: 0, failed: 0 },
    industry: { attempted: 0, successful: 0, failed: 0 },
    author: { attempted: 0, successful: 0, failed: 0 },
    modonty: { attempted: 0, successful: 0, failed: 0 },
  };

  if (stats.staleCount === 0 || !stats.expectedBase) {
    return { attempted: 0, successful: 0, failed: 0, perEntity: emptyPerEntity };
  }

  const baseUrl = stats.expectedBase;
  const all = await fetchAllEntities();
  let successful = 0;
  let failed = 0;
  let attempted = 0;

  for (const entityType of Object.keys(all) as EntityType[]) {
    const rows = all[entityType];
    const cfg = ENTITIES[entityType];

    for (const row of rows) {
      if (!row.canonicalUrl) continue;
      const expected = buildExpectedCanonical(cfg.buildPath(row.slug), baseUrl);
      if (row.canonicalUrl === expected) continue;

      attempted++;
      emptyPerEntity[entityType].attempted++;
      try {
        // Type narrowing — Prisma delegate per entity
        switch (entityType) {
          case "article":
            await db.article.update({ where: { id: row.id }, data: { canonicalUrl: expected } });
            break;
          case "client":
            await db.client.update({ where: { id: row.id }, data: { canonicalUrl: expected } });
            break;
          case "category":
            await db.category.update({ where: { id: row.id }, data: { canonicalUrl: expected } });
            break;
          case "tag":
            await db.tag.update({ where: { id: row.id }, data: { canonicalUrl: expected } });
            break;
          case "industry":
            await db.industry.update({ where: { id: row.id }, data: { canonicalUrl: expected } });
            break;
          case "author":
            await db.author.update({ where: { id: row.id }, data: { canonicalUrl: expected } });
            break;
          case "modonty":
            await db.modonty.update({ where: { id: row.id }, data: { canonicalUrl: expected } });
            break;
        }
        successful++;
        emptyPerEntity[entityType].successful++;
      } catch {
        failed++;
        emptyPerEntity[entityType].failed++;
      }
    }
  }

  revalidatePath("/database");
  return { attempted, successful, failed, perEntity: emptyPerEntity };
}
