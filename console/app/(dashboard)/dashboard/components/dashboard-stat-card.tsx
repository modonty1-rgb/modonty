import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  value: React.ReactNode;
  subLines?: string[];
}

export function DashboardStatCard({
  icon: Icon,
  title,
  description,
  value,
  subLines = [],
}: DashboardStatCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
          <CardTitle className="text-sm font-medium leading-tight">{title}</CardTitle>
        </div>
        {description ? (
          <CardDescription className="text-[11px] mt-0.5">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-lg font-semibold text-foreground tabular-nums">
          {value}
        </p>
        {subLines.length > 0 ? (
          <div className="mt-1 space-y-0.5">
            {subLines.map((line, i) => (
              <p key={i} className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
