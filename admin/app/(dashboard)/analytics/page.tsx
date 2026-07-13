import Link from "next/link";

import { getGA4Activity } from "./actions/get-ga4-activity";
import { getClients } from "./actions/get-clients";
import { getArticles } from "./actions/get-articles";
import { FullActivityClient } from "./components/full-activity-client";

// Traffic analytics lives here, not on the dashboard home (Khalid 2026-07-13:
// «الداشبورد تنكمش لا تكبر»). The home is a triage screen — only what needs a
// decision today. Anything you browse rather than act on gets its own route, so
// it loads its own data and nothing else.
//
// This reverses the 2026-07-08 merge, which folded this block into the dashboard
// and left /analytics as a bare redirect.
export default async function AnalyticsPage() {
  const [activity, clients, articles] = await Promise.all([
    getGA4Activity(),
    getClients(),
    getArticles(),
  ]);

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Traffic analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Everything Google saw — views, sources, geography, timeline
          </p>
        </div>
        <Link href="/" className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
          ← Back to dashboard
        </Link>
      </div>

      <FullActivityClient initialData={activity} clients={clients} articles={articles} />
    </div>
  );
}
