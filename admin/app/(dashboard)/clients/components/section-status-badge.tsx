"use client";

import { CheckCircle2, AlertCircle, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionStatusBadgeProps {
  status: "complete" | "error" | "incomplete" | "locked";
  errorCount?: number;
  required?: boolean;
  className?: string;
}

export function SectionStatusBadge({
  status,
  errorCount = 0,
  required = false,
  className,
}: SectionStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "complete":
        return {
          icon: CheckCircle2,
          text: "Complete",
          className: "text-green-600 dark:text-green-400",
          bgClassName: "bg-green-50 dark:bg-green-950/20",
          borderClassName: "border-green-200 dark:border-green-800",
        };
      case "error":
        return {
          icon: AlertCircle,
          text: errorCount > 0 ? `${errorCount} error${errorCount > 1 ? "s" : ""}` : "Errors",
          className: "text-red-600 dark:text-red-400",
          bgClassName: "bg-red-50 dark:bg-red-950/20",
          borderClassName: "border-red-200 dark:border-red-800",
        };
      case "incomplete":
        return {
          icon: Circle,
          text: "Incomplete",
          className: "text-muted-foreground",
          bgClassName: "bg-muted/50",
          borderClassName: "border-muted",
        };
      case "locked":
        return {
          icon: Lock,
          text: "Locked",
          className: "text-muted-foreground",
          bgClassName: "bg-muted/50",
          borderClassName: "border-muted",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border",
        config.bgClassName,
        config.borderClassName,
        config.className,
        className
      )}
      aria-label={`Section status: ${config.text}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{config.text}</span>
      {required && status !== "complete" && (
        <span className="text-destructive ml-1">*</span>
      )}
    </span>
  );
}
