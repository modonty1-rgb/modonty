"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ContactMessageStatus = "new" | "read" | "replied" | "archived";

interface StatusBadgeProps {
  status: ContactMessageStatus;
  className?: string;
}

const statusConfig: Record<
  ContactMessageStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  new: {
    label: "New",
    variant: "default",
    className: "bg-blue-500 hover:bg-blue-600 text-white border-blue-600",
  },
  read: {
    label: "Read",
    variant: "secondary",
  },
  replied: {
    label: "Replied",
    variant: "default",
    className: "bg-green-500 hover:bg-green-600 text-white border-green-600",
  },
  archived: {
    label: "Archived",
    variant: "outline",
    className: "text-muted-foreground",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.new;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
