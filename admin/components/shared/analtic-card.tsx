"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  LucideIcon,
  TrendingUp,
  TrendingDown,
  Info,
  FileText,
  Building2,
  Users,
  Mail,
  CreditCard,
  Calendar,
  AlertTriangle,
  Eye,
  BarChart3,
  Clock,
  Package,
  CheckCircle2,
  Edit,
  Archive,
  Tag,
  FileX,
  FolderTree,
  UserX,
  Search,
  Target,
  Share2,
  Stethoscope,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatValue {
  count: number;
  trend?: number;
}

// Icon mapping for string-based icon names
const iconMap: Record<string, LucideIcon> = {
  FileText,
  Building2,
  Users,
  Mail,
  CreditCard,
  Calendar,
  AlertTriangle,
  Eye,
  BarChart3,
  Clock,
  Package,
  CheckCircle2,
  Edit,
  Archive,
  Tag,
  FileX,
  FolderTree,
  UserX,
  Search,
  Target,
  Share2,
  TrendingUp,
  TrendingDown,
  Stethoscope,
  AlertCircle,
};

export interface AnalticCardProps {
  title: string;
  value: number | string | StatValue;
  icon?: LucideIcon | string;
  description?: string;
  trend?: number;
  className?: string;
  formatValue?: (value: number | string) => string;
  // SEO Score specific props
  showProgress?: boolean;
  progressValue?: number;
  progressColor?: string;
  borderLeftColor?: string;
  statusIcon?: LucideIcon | string;
  statusText?: string;
  valueColor?: string;
  // Info hover card
  info?: string | React.ReactNode;
  // Variant
  variant?: "default" | "compact";
}

function InfoHoverCard({ info, title }: { info: string | React.ReactNode; title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!open);
          }}
          className="h-4.5 w-4.5 rounded-full bg-primary/10 hover:bg-primary/20 active:bg-primary/30 flex items-center justify-center flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 border border-primary/20 cursor-pointer"
          aria-label={`Information about ${title}`}
          aria-expanded={open}
        >
          <Info className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3 shadow-lg border-2" 
        side="top" 
        align="start"
      >
        <div className="text-xs text-popover-foreground leading-relaxed">
          {typeof info === "string" ? <p>{info}</p> : info}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AnalticCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
  formatValue,
  showProgress = false,
  progressValue = 0,
  progressColor,
  borderLeftColor,
  statusIcon,
  statusText,
  valueColor,
  info,
  variant = "default",
}: AnalticCardProps) {
  // Resolve icon: support both string (for Server Components) and LucideIcon (for Client Components)
  const Icon = typeof icon === "string" ? iconMap[icon] : icon;
  
  // Resolve statusIcon: support both string and LucideIcon
  const StatusIcon = typeof statusIcon === "string" ? iconMap[statusIcon] : statusIcon;

  const getDisplayValue = () => {
    if (typeof value === "object" && "count" in value) {
      return formatValue ? formatValue(value.count) : value.count.toLocaleString();
    }
    if (typeof value === "number") {
      return formatValue ? formatValue(value) : value.toLocaleString();
    }
    return value;
  };

  const displayValue = getDisplayValue();
  const trendValue = trend !== undefined ? trend : (typeof value === "object" && "trend" in value ? value.trend : undefined);
  const isPositive = trendValue !== undefined && trendValue > 0;
  const isNegative = trendValue !== undefined && trendValue < 0;
  const isNeutral = trendValue === 0 || trendValue === undefined;

  const isCompact = variant === "compact";

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-200 border-border/50 flex flex-col relative",
        isCompact ? "min-h-[55px] w-fit min-w-[90px]" : "min-h-[100px] h-full",
        borderLeftColor && "border-l-4",
        className
      )}
      style={borderLeftColor ? { borderLeftColor } : undefined}
      role="region"
      aria-label={`${title} metric card`}
    >
      <CardHeader className={cn(
        "flex flex-row items-start justify-between space-y-0 min-w-0",
        isCompact ? "pb-0.5 px-2 pt-1" : "pb-1.5"
      )}>
        <div className="flex items-center gap-1 min-w-0 flex-1 pr-1.5">
          <CardTitle className={cn(
            "font-medium text-muted-foreground leading-tight truncate min-w-0 flex-1",
            isCompact ? "text-[8px] sm:text-[9px]" : "text-[10px] sm:text-xs"
          )}>
            {title}
          </CardTitle>
        </div>
        {Icon && (
          <div className={cn(
            "rounded-md bg-muted/50 flex items-center justify-center flex-shrink-0",
            isCompact ? "h-3.5 w-3.5" : "h-6 w-6"
          )}>
            <Icon className={cn(
              "text-muted-foreground",
              isCompact ? "h-2 w-2" : "h-3 w-3"
            )} aria-hidden="true" />
          </div>
        )}
      </CardHeader>
      <CardContent className={cn(
        "flex-1 flex flex-col",
        isCompact ? "space-y-0 px-2 pb-1" : "space-y-1"
      )}>
        <div className={cn(
          "font-bold tracking-tight tabular-nums leading-none break-words",
          isCompact ? "text-xs" : "text-base",
          valueColor
        )}>
          {displayValue}
        </div>
        {showProgress && (
          <div className={cn(
            "relative w-full overflow-hidden rounded-full bg-muted",
            isCompact ? "h-1" : "h-1.5"
          )}>
            <div
              className={cn("h-full transition-all duration-500 ease-out", progressColor)}
              style={{ width: `${progressValue}%` }}
            />
          </div>
        )}
        {description && !showProgress && (
          <p className={cn(
            "text-muted-foreground leading-relaxed line-clamp-2",
            isCompact ? "text-[8px]" : "text-[10px]"
          )}>
            {description}
          </p>
        )}
        {StatusIcon && statusText && (
          <div className="flex items-center gap-1 mt-auto">
            <StatusIcon className={cn(
              isCompact ? "h-2.5 w-2.5" : "h-3 w-3",
              valueColor
            )} />
            <span className={cn(
              "font-medium",
              isCompact ? "text-[9px]" : "text-[10px]",
              valueColor
            )}>
              {statusText}
            </span>
          </div>
        )}
        {trendValue !== undefined && !showProgress && (
          <div className={cn(
            "flex items-center gap-1",
            isCompact ? "pt-0" : "pt-0.5"
          )} role="status" aria-live="polite">
            {isPositive && <TrendingUp className={cn(
              "text-emerald-600 flex-shrink-0",
              isCompact ? "h-2 w-2" : "h-2.5 w-2.5"
            )} aria-hidden="true" />}
            {isNegative && <TrendingDown className={cn(
              "text-red-600 flex-shrink-0",
              isCompact ? "h-2 w-2" : "h-2.5 w-2.5"
            )} aria-hidden="true" />}
            {isNeutral && <TrendingUp className={cn(
              "text-muted-foreground flex-shrink-0",
              isCompact ? "h-2 w-2" : "h-2.5 w-2.5"
            )} aria-hidden="true" />}
            <span
              className={cn(
                "font-medium tabular-nums",
                isCompact ? "text-[8px]" : "text-[9px]",
                isPositive && "text-emerald-600",
                isNegative && "text-red-600",
                isNeutral && "text-muted-foreground"
              )}
            >
              {isPositive && "+"}
              {Math.abs(trendValue).toFixed(1)}% {isNeutral ? "" : "vs last period"}
            </span>
          </div>
        )}
      </CardContent>
      {info && (
        <div className={cn(
          "absolute right-2",
          isCompact ? "bottom-1.5" : "bottom-2"
        )}>
          <InfoHoverCard info={info} title={title} />
        </div>
      )}
    </Card>
  );
}
