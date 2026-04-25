import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { ReactNode } from "react";

export type SectionAccent = "blue" | "cyan" | "emerald";

interface DrillDown {
  href: string;
  label: string;
}

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  accent: SectionAccent;
  drillDown?: DrillDown;
  liveBadge?: boolean;
  children: ReactNode;
}

const ACCENT_BORDER: Record<SectionAccent, string> = {
  blue: "border-t-blue-500",
  cyan: "border-t-cyan-500",
  emerald: "border-t-emerald-500",
};

const ACCENT_ICON_BG: Record<SectionAccent, string> = {
  blue: "bg-blue-500/15 text-blue-500",
  cyan: "bg-cyan-500/15 text-cyan-500",
  emerald: "bg-emerald-500/15 text-emerald-500",
};

const ACCENT_LINK: Record<SectionAccent, string> = {
  blue: "text-blue-500 hover:bg-blue-500/10",
  cyan: "text-cyan-500 hover:bg-cyan-500/10",
  emerald: "text-emerald-500 hover:bg-emerald-500/10",
};

export function DashboardSection({
  title,
  subtitle,
  icon,
  accent,
  drillDown,
  liveBadge = false,
  children,
}: DashboardSectionProps) {
  return (
    <Card className={`border-t-4 ${ACCENT_BORDER[accent]} overflow-hidden`}>
      <div className="flex items-center justify-between gap-4 p-5 border-b">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${ACCENT_ICON_BG[accent]}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold leading-tight truncate">{title}</h2>
              {liveBadge && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {drillDown && (
          <Link
            href={drillDown.href}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold shrink-0 transition-colors ${ACCENT_LINK[accent]}`}
          >
            {drillDown.label}
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
