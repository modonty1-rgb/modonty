import { SubscriptionStatus, PaymentStatus } from "@prisma/client";

/**
 * Flexible interface for client data used in business metrics calculations
 * Only requires the fields actually used by the functions
 */
interface ClientWithRelations {
  subscriptionTierConfig?: {
    price: number;
    articlesPerMonth: number;
  } | null;
  articles?: Array<{ datePublished: Date | null }>;
  articlesPerMonth?: number | null;
  subscriptionEndDate?: Date | null;
  subscriptionStatus: SubscriptionStatus;
  paymentStatus: PaymentStatus;
}

export function calculateRevenue(client: ClientWithRelations): number {
  if (!client.subscriptionTierConfig?.price) {
    return 0;
  }
  return client.subscriptionTierConfig.price;
}

export function getSubscriptionDaysRemaining(client: ClientWithRelations): number | null {
  if (!client.subscriptionEndDate) {
    return null;
  }
  const now = new Date();
  const endDate = new Date(client.subscriptionEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function calculateDeliveryRate(
  client: ClientWithRelations,
  currentMonthArticles: number
): {
  delivered: number;
  promised: number;
  rate: number;
  isBehind: boolean;
} {
  const promised =
    client.articlesPerMonth ?? client.subscriptionTierConfig?.articlesPerMonth ?? 0;
  const delivered = currentMonthArticles;
  const rate = promised > 0 ? Math.round((delivered / promised) * 100) : 0;
  const isBehind = delivered < promised;

  return {
    delivered,
    promised,
    rate,
    isBehind,
  };
}

export function isExpiringSoon(
  client: ClientWithRelations,
  days: number = 30
): boolean {
  const daysRemaining = getSubscriptionDaysRemaining(client);
  if (daysRemaining === null) {
    return false;
  }
  return daysRemaining > 0 && daysRemaining <= days;
}

export function getClientStatus(client: ClientWithRelations): {
  subscription: SubscriptionStatus;
  payment: PaymentStatus;
  isActive: boolean;
  isPaid: boolean;
  isOverdue: boolean;
} {
  return {
    subscription: client.subscriptionStatus,
    payment: client.paymentStatus,
    isActive: client.subscriptionStatus === SubscriptionStatus.ACTIVE,
    isPaid: client.paymentStatus === PaymentStatus.PAID,
    isOverdue: client.paymentStatus === PaymentStatus.OVERDUE,
  };
}
