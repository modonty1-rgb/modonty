import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface AnalyticsStatCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  value: React.ReactNode;
  subLines?: string[];
}

export function AnalyticsStatCard({
  icon: Icon,
  title,
  description,
  value,
  subLines = [],
}: AnalyticsStatCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary shrink-0" />
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </div>
        {description ? (
          <CardDescription className="text-xs">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-foreground tabular-nums">
          {value}
        </p>
        {subLines.length > 0 ? (
          <div className="mt-1.5 space-y-0.5">
            {subLines.map((line, i) => (
              <p key={i} className="text-xs text-muted-foreground">
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
