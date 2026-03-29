import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface DashboardActionCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  value: React.ReactNode;
  ctaLabel: string;
}

export function DashboardActionCard({
  href,
  icon: Icon,
  title,
  description,
  value,
  ctaLabel,
}: DashboardActionCardProps) {
  return (
    <Link href={href} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
      <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full border-border hover:border-primary/30">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
            <CardTitle className="text-sm font-medium leading-tight">{title}</CardTitle>
          </div>
          <CardDescription className="text-[11px] mt-0.5 line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-base font-semibold text-foreground tabular-nums">
            {value}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 underline underline-offset-2">
            {ctaLabel} →
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
