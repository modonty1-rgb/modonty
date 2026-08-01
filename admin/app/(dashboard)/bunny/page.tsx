import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getMediaReport, getBillingReport } from "./actions/bunny-report";

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
    </div>
  );
}
