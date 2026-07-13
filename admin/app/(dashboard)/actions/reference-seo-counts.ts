"use server";

import { db } from "@/lib/db";
import { computeReferenceSeoScore } from "@modonty/database/lib/seo/reference/seo-score";
import type { JsonLdValidationReport } from "@modonty/database/lib/seo/client/types";

/**
 * Reference data — categories, tags, industries, authors (Khalid 2026-07-13).
 * These are the listing pages Google indexes alongside the articles, and nobody ever
 * looks at their SEO. So the dashboard shows exactly one thing per group: how many of
 * them are failing.
 *
 * The score comes from dataLayer/lib/seo/reference — the same source of truth as the
 * client and article scorers, on the same contract.
 *
 * Every select below must fetch ALL FOUR fields the scorer reads. It cannot tell "not
 * selected" from "empty", so a missing one silently drags every row to the same low
 * number — that bug has now shipped three times today, hence one shared const.
 */

const SEO_SELECT = {
  id: true,
  name: true,
  slug: true,
  nextjsMetadata: true,
  jsonLdStructuredData: true,
  jsonLdValidationReport: true,
} as const;

/** Below this a listing page is not doing its job in search. */
const FAILING = 60;

export interface ReferenceGroup {
  key: "categories" | "tags" | "industries" | "authors";
  label: string;
  total: number;
  /** Score below 60 — the only number on the card that asks anything of you. */
  failing: number;
}

interface Row {
  name: string;
  nextjsMetadata: unknown;
  jsonLdStructuredData: string | null;
  jsonLdValidationReport: unknown;
}

function summarise(rows: Row[]): { total: number; failing: number } {
  const scores = rows.map(
    (r) =>
      computeReferenceSeoScore({
        name: r.name,
        nextjsMetadata: r.nextjsMetadata,
        jsonLdStructuredData: r.jsonLdStructuredData,
        jsonLdValidationReport: (r.jsonLdValidationReport ?? null) as JsonLdValidationReport | null,
      }).score
  );
  return {
    total: rows.length,
    failing: scores.filter((s) => s < FAILING).length,
  };
}

export async function getReferenceSeoCounts(): Promise<ReferenceGroup[]> {
  const [categories, tags, industries, authors] = await Promise.all([
    db.category.findMany({ select: SEO_SELECT, take: 500 }),
    db.tag.findMany({ select: SEO_SELECT, take: 500 }),
    db.industry.findMany({ select: SEO_SELECT, take: 500 }),
    db.author.findMany({ select: SEO_SELECT, take: 500 }),
  ]);

  return [
    { key: "categories", label: "Categories", ...summarise(categories) },
    { key: "tags", label: "Tags", ...summarise(tags) },
    { key: "industries", label: "Industries", ...summarise(industries) },
    { key: "authors", label: "Authors", ...summarise(authors) },
  ];
}

export interface ReferenceRow {
  id: string;
  name: string;
  slug: string;
  seoScore: number;
  /** Whether anything was ever generated — a 0 with no metadata is a different fix. */
  hasMetadata: boolean;
  hasJsonLd: boolean;
}

/**
 * One group's rows, scored. Same scorer as the cards above, so the count on the card
 * and the rows on the page can never tell two different stories.
 */
export async function getReferenceRows(key: ReferenceGroup["key"]): Promise<ReferenceRow[]> {
  // Four separate calls, not one dynamic `db[model]`: Prisma types each delegate
  // independently, so a union of them has no compatible call signature. Being explicit
  // is what keeps `select` type-checked — and a mis-typed select is exactly how the
  // "every row scores the same low number" bug gets in.
  const args = { select: SEO_SELECT, orderBy: { name: "asc" }, take: 500 } as const;
  const rows =
    key === "categories"
      ? await db.category.findMany(args)
      : key === "tags"
        ? await db.tag.findMany(args)
        : key === "industries"
          ? await db.industry.findMany(args)
          : await db.author.findMany(args);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    hasMetadata: r.nextjsMetadata != null,
    hasJsonLd: Boolean(r.jsonLdStructuredData?.trim()),
    seoScore: computeReferenceSeoScore({
      name: r.name,
      nextjsMetadata: r.nextjsMetadata,
      jsonLdStructuredData: r.jsonLdStructuredData,
      jsonLdValidationReport: (r.jsonLdValidationReport ?? null) as JsonLdValidationReport | null,
    }).score,
  }));
}
