import type { CheckoutOrderStatus } from "@prisma/client";

export interface OrderStatusCopy {
  label: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
}

const COPY: Record<CheckoutOrderStatus, OrderStatusCopy> = {
  AWAITING_PAYMENT: { label: "بانتظار الدفع", badgeVariant: "outline" },
  AWAITING_TRANSFER: { label: "بانتظار التحويل", badgeVariant: "outline" },
  PAID: { label: "مدفوع", badgeVariant: "default" },
  FAILED: { label: "فشل", badgeVariant: "destructive" },
  CANCELLED: { label: "ملغى", badgeVariant: "secondary" },
  REFUNDED: { label: "مسترد", badgeVariant: "secondary" },
};

export function orderStatusCopy(status: CheckoutOrderStatus): OrderStatusCopy {
  return COPY[status];
}
