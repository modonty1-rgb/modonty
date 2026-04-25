import { Search } from "lucide-react";

import { DashboardSection } from "@/app/(dashboard)/components/dashboard-section";

export function GscSectionSkeleton() {
  return (
    <DashboardSection
      title="Search Console"
      subtitle="Loading live data from Google…"
      icon={<Search className="h-5 w-5" />}
      accent="blue"
    >
      {/* KPI strip skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 border-b">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="h-3 w-16 rounded bg-muted animate-pulse" />
              <div className="h-3 w-10 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-7 w-20 rounded bg-muted animate-pulse" />
            <div className="h-10 w-full rounded bg-muted/50 animate-pulse mt-2" />
          </div>
        ))}
      </div>

      {/* 3-column body skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-5">
        {[0, 1, 2].map((col) => (
          <div key={col}>
            <div className="h-3 w-20 rounded bg-muted animate-pulse mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-9 rounded-md bg-muted/50 animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}
