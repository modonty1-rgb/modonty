import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getMediaReport, getBillingReport } from "./actions/bunny-report";
import type { ZoneTree } from "./actions/bunny-report";

const usd = (n: number) =>
  n > 0 && n < 0.01 ? "< $0.01" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const bandwidth = (bytes: number) =>
  bytes >= 1073741824
    ? `${(bytes / 1073741824).toFixed(2)} GB`
    : bytes >= 1048576
      ? `${(bytes / 1048576).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`;

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums ${strong ? "text-base font-bold" : "font-medium"}`}>{value}</span>
    </div>
  );
}

/**
 * What each zone is for — the report shows numbers, and a number without its purpose
 * cannot be judged. Wording matches the locked zone roles in shared/lib/bunny.ts.
 */
const ZONE_PURPOSE: Record<ZoneTree["zone"], string> = {
  clients: "Client & article images, plus their auto-generated SEO crops",
  assets: "Platform identity — logo, wordmark, OG images, industry heroes",
  reels: "Reels videos and the client-gallery images they are built from",
};

function StorageMap({ tree }: { tree: ZoneTree[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {tree.map((z) => (
        <Card key={z.zone}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {z.zone}
              <span className="ms-2 font-mono text-xs font-normal text-muted-foreground">{z.storageZone}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">{ZONE_PURPOSE[z.zone]}</p>
          </CardHeader>
          <CardContent className="text-sm">
            <Row label="Files in this zone" value={`${z.files} · ${z.megabytes} MB`} strong />
            <div className="my-2 border-t" />
            {z.folders.length === 0 ? (
              <p className="text-xs text-muted-foreground">Empty.</p>
            ) : (
              z.folders.map((f) =>
                // A folder with sub-folders opens; a flat one is a plain row. Same visual
                // weight either way, so the eye reads one list, not two kinds of thing.
                f.children.length > 0 ? (
                  <details key={f.name} className="group">
                    <summary className="cursor-pointer list-none py-1 marker:content-none">
                      <span className="flex items-baseline justify-between gap-4">
                        <span className="font-medium">
                          <span className="me-1 inline-block text-muted-foreground transition group-open:rotate-90">›</span>
                          {f.name}
                          <span className="ms-1 text-xs text-muted-foreground">({f.children.length})</span>
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {f.files} · {f.megabytes} MB
                        </span>
                      </span>
                    </summary>
                    <div className="ms-4 border-s ps-3">
                      {f.children.map((c) => (
                        <Row key={c.name} label={c.name} value={`${c.files} · ${c.megabytes} MB`} />
                      ))}
                    </div>
                  </details>
                ) : (
                  <Row key={f.name} label={f.name} value={`${f.files} · ${f.megabytes} MB`} />
                )
              )
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function BunnyPage() {
  const [media, billing] = await Promise.all([getMediaReport(), getBillingReport()]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Bunny</h1>
        <p className="text-sm text-muted-foreground">Live report — media storage, cost and remaining balance.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Media Files</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {"error" in media ? (
              <p className="text-red-500">{media.error}</p>
            ) : (
              <>
                <Row label="Media cards in database" value={String(media.cardsTotal)} />
                <Row label="Cards with a Bunny copy" value={String(media.cardsOnBunny)} />
                <Row label="Cards still pending" value={String(media.cardsPending)} />
                <div className="my-2 border-t" />
                {media.clients && (
                  <>
                    <Row label="Client & article images (originals)" value={String(media.clients.originals)} />
                    <Row label="Auto-generated SEO crops" value={String(media.clients.crops)} />
                  </>
                )}
                {media.assets && (
                  <>
                    <Row label="Platform identity files (protected)" value={String(media.assets.protectedFiles)} />
                    <Row label="Re-hosted legacy files (migrated/)" value={String(media.assets.migrated)} />
                  </>
                )}
                {media.reels && <Row label="Reels files" value={String(media.reels.files)} />}
                <div className="my-2 border-t" />
                <Row label="Total storage used" value={`${media.totalMegabytes} MB`} strong />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cost & Balance</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {"error" in billing ? (
              <p className="text-red-500">{billing.error}</p>
            ) : (
              <>
                <Row label="Remaining balance" value={usd(billing.balance)} strong />
                <Row label="Charges this month" value={usd(billing.thisMonthCharges)} />
                <Row label="Bandwidth this month" value={bandwidth(billing.monthlyBandwidthBytes)} />
                <Row label="Estimated runway (at the $1/month minimum fee)" value={`~${billing.runwayMonths} months`} />
                <div className="my-2 border-t" />
                <p className="mb-1 font-medium">Recent account activity</p>
                {billing.records.map((r) => (
                  <Row
                    key={`${r.date}-${r.amount}`}
                    label={`${r.date} — ${r.kind === "deposit" ? "Deposit" : r.kind === "charge" ? "Monthly charge" : "Other"}`}
                    value={`${r.kind === "deposit" ? "+" : "−"}${usd(r.amount)}`}
                  />
                ))}
                <p className="mt-2 text-xs text-muted-foreground">
                  Storage and traffic are billed per use; Bunny applies a $1 minimum charge per month.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {!("error" in media) && media.tree.length > 0 && (
        <>
          <div>
            <h2 className="text-base font-bold">Storage map</h2>
            <p className="text-sm text-muted-foreground">
              What actually sits in each zone right now — read live from Bunny, not from the database.
            </p>
          </div>
          <StorageMap tree={media.tree} />
        </>
      )}
    </div>
  );
}
