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
}

export interface ArchiveFilters {
  industries: FilterOption[];
  categories: CategoryOption[];
  tags: FilterOption[];
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
      category: { select: { name: true, slug: true } },
      client: { select: { industry: { select: { name: true, slug: true } } } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
    },
  });

  const industries = new Map<string, FilterOption>();
  const categories = new Map<string, CategoryOption>();
  const tags = new Map<string, FilterOption>();

  const bump = (map: Map<string, FilterOption>, item: { name: string; slug: string } | null | undefined) => {
    if (!item) return;
    const existing = map.get(item.slug);
    if (existing) existing.count += 1;
    else map.set(item.slug, { name: item.name, slug: item.slug, count: 1 });
  };

  for (const row of rows) {
    const industry = row.client?.industry ?? null;
    bump(industries, industry);

    if (row.category) {
      const current = categories.get(row.category.slug);
      if (current) {
        current.count += 1;
        if (industry && !current.industrySlugs.includes(industry.slug)) {
          current.industrySlugs.push(industry.slug);
        }
      } else {
        categories.set(row.category.slug, {
          name: row.category.name,
          slug: row.category.slug,
          count: 1,
          industrySlugs: industry ? [industry.slug] : [],
        });
      }
    }

    for (const { tag } of row.tags) bump(tags, tag);
  }

  // Busiest first, not alphabetical: 59% of the articles sit in one category, so an alphabetical
  // list buries the only entries most visitors want.
  const byCount = <T extends FilterOption>(list: T[]) => list.sort((a, b) => b.count - a.count);

  return {
    industries: byCount([...industries.values()]),
    categories: byCount([...categories.values()]),
    tags: byCount([...tags.values()]),
    total: rows.length,
  };
}
