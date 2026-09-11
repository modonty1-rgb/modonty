import type { CheckoutOrderStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { orderStatusCopy } from "../helpers/order-status-copy";

export function OrderStatusBadge({ status }: { status: CheckoutOrderStatus }) {
  const copy = orderStatusCopy(status);
  return <Badge variant={copy.badgeVariant}>{copy.label}</Badge>;
}
