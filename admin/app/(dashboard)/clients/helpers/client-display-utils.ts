/** Shared display utilities for client data across all client components. */

/** Maps a SubscriptionTier enum value to its display name. */
export function getTierDisplayName(tier: string | null): string {
  if (!tier) return "Not Set";
  switch (tier) {
    case "BASIC":
      return "Basic";
    case "STANDARD":
      return "Standard";
    case "PRO":
      return "Pro";
    case "PREMIUM":
      return "Premium";
    default:
      return tier;
  }
}

/** Calculates how many days remain until a subscription end date. */
export function getSubscriptionDaysRemaining(
  endDate: Date | string | null,
): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/** Calculates delivery rate as a rounded percentage. Returns 0 if promised is 0. */
export function calculateDeliveryRate(
  promised: number,
  delivered: number,
): number {
  if (promised <= 0) return 0;
  return Math.round((delivered / promised) * 100);
}
