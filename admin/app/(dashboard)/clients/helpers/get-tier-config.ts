import { getTierConfigByTier } from "@/app/(dashboard)/subscription-tiers/actions/tier-actions";
import { SubscriptionTier } from "@prisma/client";

export async function getTierConfig(tier: SubscriptionTier | null) {
  if (!tier) return null;
  return await getTierConfigByTier(tier);
}
