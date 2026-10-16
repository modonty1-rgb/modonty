import { ArticleStatus, SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { NOT_ARCHIVED } from "@modonty/shared/lib/taxonomy/not-archived";

export type AnswerableIndustry = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  partnerCount: number;
};

/**
 * **The industries Modo can actually answer from** — at least one PUBLISHED article by an
 * ACTIVE partner, the same two conditions `get-industry-scope.ts` reads the answer from.
 *
 * "Has an active partner" was the old test, and it was not enough (measured 16 Oct 2026):
 * «الرعاية الصحية» had 2 active partners and 0 published articles, so a CBC question was routed
 * there and answered «ما عندي جواب» — while the 154 medical articles sat under «السياحة العلاجية».
 * Offering an industry whose scope is empty is a dead end that looks like a broken Modo.
 *
 * One reader for both the picker (`api/industries`) and the guesser (`api/suggest-industry`),
 * so a chip can never be offered that the guesser would skip, or the other way round.
 */
export async function getAnswerableIndustries(): Promise<AnswerableIndustry[]> {
  const withArticles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      client: { subscriptionStatus: SubscriptionStatus.ACTIVE, industryId: { not: null } },
    },
    select: { client: { select: { industryId: true } } },
    distinct: ["clientId"],
    take: 2000,
  });
  const ids = [...new Set(withArticles.map((a) => a.client.industryId).filter((id): id is string => !!id))];
  if (!ids.length) return [];

  const industries = await db.industry.findMany({
    where: { ...NOT_ARCHIVED, id: { in: ids } },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { clients: { where: { subscriptionStatus: SubscriptionStatus.ACTIVE } } } },
    },
    take: 50,
  });

  return industries
    .map((i) => ({ id: i.id, name: i.name, slug: i.slug, description: i.description, partnerCount: i._count.clients }))
    .sort((a, b) => b.partnerCount - a.partnerCount);
}
