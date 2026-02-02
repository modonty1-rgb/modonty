import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMetric } from "../helpers/format-metrics";

interface MetricChipProps {
  icon: LucideIcon;
  value: number;
  label: string;
  color?: string;
}

export function MetricChip({ 
  icon: Icon, 
  value, 
  label,
  color = "text-muted-foreground" 
}: MetricChipProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 p-2 rounded-md bg-muted/50">
      <Icon className={cn("h-3 w-3", color)} />
      <span className="font-semibold text-foreground">{formatMetric(value)}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
