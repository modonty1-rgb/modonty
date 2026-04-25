import { Info, Database, Cloud, Globe, Calculator } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/**
 * Read-only info panel that explains where each datapoint on this page
 * comes from and the known caching/limit caveats. Helps the admin trust
 * the numbers and know when to refresh.
 */
export function DataSourcesNote() {
  return (
    <Card>
      <CardContent className="pt-5 pb-5 px-5 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-bold">Where this data comes from</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <Section
            icon={<Cloud className="h-3.5 w-3.5 text-blue-500" />}
            title="Direct from Google Search Console API"
            items={[
              "Clicks · Impressions · CTR · Position (cached 3h)",
              "Top pages list — last 28 days, top 100 by clicks",
              "Sitemap list + status (live, cached 60s)",
              "URL Inspection: canonical · robots · mobile · last crawl (cached 7 days · refreshable per row)",
            ]}
          />

          <Section
            icon={<Globe className="h-3.5 w-3.5 text-violet-500" />}
            title="Direct from live site"
            items={[
              "robots.txt content — fetched live from modonty.com (more current than Google's cache)",
            ]}
          />

          <Section
            icon={<Calculator className="h-3.5 w-3.5 text-amber-500" />}
            title="Computed locally (GSC + DB join)"
            items={[
              "Live / Missing / Archived classification",
              "Coverage % = Live ÷ (Total − non-article)",
              "Technical Health counts (canonical · robots · mobile · soft 404)",
              "Pending indexing (DB published \\ GSC indexed)",
            ]}
          />

          <Section
            icon={<Database className="h-3.5 w-3.5 text-emerald-500" />}
            title="Known limits"
            items={[
              "Google delays new data by 2–3 days (industry-wide, not us)",
              "Pages with 0 impressions in 28d don't appear in Coverage table",
              'GSC API doesn\'t expose: "Crawled but not indexed" reasons, manual actions, security issues, backlinks',
              "URL Inspection: 2,000 / day quota (free tier)",
              "Indexing API: 200 / day quota for URL_UPDATED + URL_REMOVED",
            ]}
          />
        </div>

        <p className="text-[10px] text-muted-foreground italic pt-2 border-t">
          Numbers refresh automatically based on the cache windows above. Use{" "}
          <strong>Inspect all PUBLISHED</strong> to force a fresh URL Inspection sweep, or{" "}
          <strong>Refresh</strong> next to any card.
        </p>
      </CardContent>
    </Card>
  );
}

function Section({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 font-bold text-foreground/90 mb-1.5">
        {icon}
        {title}
      </div>
      <ul className="space-y-1 text-muted-foreground ms-5 list-disc">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
