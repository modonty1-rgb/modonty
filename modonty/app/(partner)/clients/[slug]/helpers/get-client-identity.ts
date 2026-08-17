import { cacheTag, cacheLife } from "next/cache";
import { SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * The four fields the partner layout needs for its breadcrumb + GTM context — fully
 * cached, no live stats. The layout used to call `getClientPageData`, which also
 * fetches LIVE follower/view totals; that uncached read sat outside any Suspense
 * boundary once `clients/[slug]` moved to its own route group (the listing's
 * `loading.tsx` no longer wraps it) and failed the prerender with "blocking-route".
 * Same tag as the rest of the partner data, so admin's revalidateTag("clients") refreshes it.
 */
export async function getClientIdentity(decodedSlug: string) {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");
  return db.client.findUnique({
    where: { slug: decodedSlug, subscriptionStatus: SubscriptionStatus.ACTIVE },
    select: { id: true, name: true, slug: true, seoTitle: true },
  });
}
