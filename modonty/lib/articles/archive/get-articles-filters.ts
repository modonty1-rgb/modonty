import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

export interface FilterOption {
  name: string;
  slug: string;
  /** Published articles behind this option. Never rendered without it. */
  count: number;
}

export interface CategoryOption extends FilterOption {
  /** Industry slugs this category actually appears under — derived, never stored. */
  industrySlugs: string[];
  /**
   * Its sub-categories (`Category.parentId`), busiest first. On a main category `count` already
   * includes them — picking the parent shows their articles too (`get-articles-archive.ts`).
   */
  children: CategoryOption[];
}

export interface ArchiveFilters {
  industries: FilterOption[];
  categories: CategoryOption[];
  total: number;
}

/**
 * What the right rail offers, with the number beside every name.
 *
 * The count is not decoration: without it a visitor clicks a category and lands on an empty page,
 * which is worse than never seeing it. Measured 2026-08-19 — five of fifteen categories hold zero
 * published articles, so they are dropped here rather than hidden in the component.
 *
 * The category→industry link is COMPUTED from the articles themselves (article → partner →
 * industry), because no such relation exists in the schema and storing one would start out wrong:
 * «التقنية والذكاء الاصطناعي» genuinely spans two industries, and a single stored id would hide one
 * of them. Nine of the ten categories that carry articles map to exactly one industry, so the
 * derivation is right today and stays right as content is published.
 *
 * Tags are deliberately NOT offered here (Khalid, 2026-08-19: «remove tag card no need»). Measured
 * the same day: seven of twenty-three tags belong to a single partner and nine of the top twelve
 * are one partner's keyword set — «أفضل شركة سيو في الرياض» is a search phrase, not a topic anyone
 * browses. `/articles?tag=` still works for the links coming from `/tags/[slug]`.
 *
 * One read of 117 rows, cached hourly under the same `articles` tag every publish revalidates.
 */
export async function getArticlesFilters(): Promise<ArchiveFilters> {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");

  const rows = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    },
    select: {
      category: { select: { name: true, slug: true, parent: { select: { name: true, slug: true } } } },
      client: { select: { industry: { select: { name: true, slug: true } } } },
    },
  });

  const industries = new Map<string, FilterOption>();
  const categories = new Map<string, CategoryOption>();
  const childSlugs = new Set<string>();

  for (const row of rows) {
    const industry = row.client?.industry ?? null;

    if (industry) {
      const existing = industries.get(industry.slug);
      if (existing) existing.count += 1;
      else industries.set(industry.slug, { name: industry.name, slug: industry.slug, count: 1 });
    }

    if (row.category) {
      // A sub-category's article counts on the sub-category AND on its main category.
      const own = tally(categories, row.category, industry?.slug);
      const parent = row.category.parent;
      if (parent) {
        const main = tally(categories, parent, industry?.slug);
        if (!main.children.includes(own)) main.children.push(own);
        childSlugs.add(own.slug);
      }
    }
  }

  // Busiest first, not alphabetical: 59% of the articles sit in one category, so an alphabetical
  // list buries the only entries most visitors want.
  const byCount = <T extends FilterOption>(list: T[]) => list.sort((a, b) => b.count - a.count);

  // Main categories at the top level, each carrying its sub-categories — until 24 Sep 2026 the
  // list was flat, so «سوالف وأخبار» sat beside «ترند مدونتي» as a peer instead of under it.
  const roots = byCount([...categories.values()].filter((c) => !childSlugs.has(c.slug)));
  for (const root of roots) byCount(root.children);

  return {
    industries: byCount([...industries.values()]),
    categories: roots,
    total: rows.length,
  };
}

function tally(
  map: Map<string, CategoryOption>,
  category: { name: string; slug: string },
  industrySlug: string | undefined,
): CategoryOption {
  let option = map.get(category.slug);
  if (!option) {
    option = { name: category.name, slug: category.slug, count: 0, industrySlugs: [], children: [] };
    map.set(category.slug, option);
  }
  option.count += 1;
  if (industrySlug && !option.industrySlugs.includes(industrySlug)) option.industrySlugs.push(industrySlug);
  return option;
}
