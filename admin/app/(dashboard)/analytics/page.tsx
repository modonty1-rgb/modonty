import { redirect } from "next/navigation";

// The analytics overview merged into the dashboard home (2026-07-08 — approved
// mockup dashboard-thermometer-merge-v1). Old links keep working; the
// drill-down pages (/analytics/leads|cta|engagement) live on unchanged.
export default function AnalyticsPage() {
  redirect("/");
}
