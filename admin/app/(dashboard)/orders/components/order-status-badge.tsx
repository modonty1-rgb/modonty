import type { CheckoutOrderStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { orderStatusCopy } from "../helpers/order-status-copy";

/** `className` لحجمٍ أصغر في الجدول الكثيف؛ صفحةُ التفصيل تبقى بالحجم الافتراضيّ. */
export function OrderStatusBadge({ status, className }: { status: CheckoutOrderStatus; className?: string }) {
  const copy = orderStatusCopy(status);
  return <Badge variant={copy.badgeVariant} className={className}>{copy.label}</Badge>;
}
