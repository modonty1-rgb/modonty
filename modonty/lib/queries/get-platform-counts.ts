import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus, SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";

export interface PlatformCounts {
  /** Verified partners — modonty itself excluded. */
  partners: number;
  /** Published articles across the whole platform. */
  articles: number;
  /** Fields that actually have a partner in them — an empty field is not a field. */
  industries: number;
}

/**
 * The three numbers `AboutCard` puts in the rail.
 *
 * Every filter here MIRRORS the page the visitor lands on if they click through, so the
 * card can never promise a number the destination then contradicts:
 *
 * - partners  → `SubscriptionStatus.ACTIVE`, minus `coreClientId` — exactly what
 *   `/clients` lists (`get-clients-list.ts:71` + `clients/page.tsx:43`). Modonty is a
 *   Client row because its articles need one, but it is not a partner.
 * - articles  → PUBLISHED and already due, the same pair every feed query uses.
 * - industries → counted through the partner relation, so a field with no active partner
 *   is not advertised.
 *
 * Counts only — no rows leave the database. `/about` reads full lists and takes `.length`;
 * that is fine for a page built around them, and wrong for a 300px rail card.
 */
export async function getPlatformCounts(): Promise<PlatformCounts> {
  "use cache";
  cacheTag("clients", "articles", "settings");
  cacheLife("hours");

  const coreClientId = await getCoreClientId();
  const activePartner = {
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    ...(coreClientId ? { id: { not: coreClientId } } : {}),
  };

  const [partners, articles, industries] = await Promise.all([
    db.client.count({ where: activePartner }),
    db.article.count({
      where: { status: ArticleStatus.PUBLISHED, datePublished: { lte: new Date() } },
    }),
    db.industry.count({ where: { clients: { some: activePartner } } }),
  ]);

  return { partners, articles, industries };
}
