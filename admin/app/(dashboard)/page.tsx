import { Suspense } from "react";
import { BarChart3, Construction } from "lucide-react";
import { format } from "date-fns";

import { getDashboardAlerts } from "./actions/dashboard-actions";
import { DashboardAlertsBanner } from "./components/dashboard-alerts-banner";
import { DateRangeSelector } from "./components/date-range-selector";
import { DashboardSection } from "./components/dashboard-section";
import { DbSection } from "./components/sections/db-section";
import { GscSection } from "./components/sections/gsc-section";
import { GscSectionSkeleton } from "./components/sections/gsc-section-skeleton";

export default async function DashboardPage() {
  const alerts = await getDashboardAlerts();
  const today = new Date();

  return (
    <div className="px-6 py-6 max-w-[1280px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(today, "EEEE, MMM d, yyyy")}
          </p>
        </div>

        <DateRangeSelector />
      </div>

      {/* Alert Bar (cross-source urgent issues) */}
      <DashboardAlertsBanner alerts={alerts} />

      {/* Section 1 — Search Console (live) */}
      <Suspense fallback={<GscSectionSkeleton />}>
        <GscSection days={7} />
      </Suspense>

      {/* Section 2 — GTM / GA4 (placeholder by design — live integration deferred) */}
      <DashboardSection
        title="GTM / GA4 Analytics"
        subtitle="User engagement · live integration coming in next phase"
        icon={<BarChart3 className="h-5 w-5" />}
        accent="cyan"
        drillDown={{ href: "/analytics", label: "Open Analytics" }}
      >
        <PlaceholderBody
          title="Under construction"
          description="Real-time visitors, sessions, traffic sources and conversion events will appear here once GA4 Data API is wired up."
        />
      </DashboardSection>

      {/* Section 3 — DB / Operations (live now) */}
      <DbSection />
    </div>
  );
}

function PlaceholderBody({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-10 flex flex-col items-center justify-center text-center gap-3 bg-[repeating-linear-gradient(135deg,transparent,transparent_12px,rgba(148,163,184,0.04)_12px,rgba(148,163,184,0.04)_24px)]">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
        <Construction className="h-5 w-5" />
      </div>
      <div className="space-y-1 max-w-md">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
