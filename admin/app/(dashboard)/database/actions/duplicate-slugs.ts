"use server";

import { db } from "@/lib/db";

export interface DuplicateSlugEntry {
  slug: string;
  clientCount: number;
}

export interface DuplicateSlugStats {
  crossClientSlugs: number;
  topDuplicates: DuplicateSlugEntry[];
}

export async function getDuplicateSlugs(): Promise<DuplicateSlugStats> {
  const result = (await db.article.aggregateRaw({
    pipeline: [
      { $group: { _id: "$slug", clientIds: { $addToSet: "$clientId" } } },
      { $match: { $expr: { $gt: [{ $size: "$clientIds" }, 1] } } },
      { $sort: { _id: 1 } },
      { $limit: 5 },
      { $project: { slug: "$_id", clientCount: { $size: "$clientIds" }, _id: 0 } },
    ],
  })) as unknown as DuplicateSlugEntry[];

  return {
    crossClientSlugs: result.length,
    topDuplicates: result,
  };
}
