import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getBookingsReport } from "../../actions/get-bookings-report";
import { FAIL_REASON_LABEL } from "@/lib/analytics/book-funnel";

// Bookings report — built from the approved mockup
// (documents/mockups/admin-visitor-actions-v1.html, Khalid 2026-07-13).
// Answers three questions the flat leads table could not: which client is getting
// the bookings, which surface actually converts, and who is a guest vs a member.

const SOURCE_LABEL: Record<string, string> = {
  article_dock: "sticky bar inside an article",
  article_card: "article card",
  client_page: "client profile page",
  client_list: "clients listing",
};

function fmt(iso: string): string {
  return iso.slice(0, 16).replace("T", " ");
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "new"
      ? "bg-red-500/15 text-red-700 dark:text-red-400"
      : status === "contacted"
        ? "bg-amber-500/15 text-amber-800 dark:text-amber-400"
        : status === "done"
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
          : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{status}</span>;
}

function FunnelStep({
  label,
  value,
  source,
  good,
}: {
  label: string;
  value: number;
  source: string;
  good?: boolean;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-[10px] font-bold uppercase text-muted-foreground">
        {source}
      </p>
      <p
        className={`text-2xl font-bold tabular-nums ${good ? "text-emerald-600 dark:text-emerald-400" : ""}`}
      >
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

/** The number that fell through the crack between two steps. Zero is good news. */
function FunnelGap({ value, note }: { value: number; note: string }) {
  const lost = value > 0;
  return (
    <div className="flex flex-col items-center justify-center px-1 text-center">
      <span className="text-lg text-muted-foreground">↓</span>
      <p
        className={`text-lg font-bold tabular-nums ${lost ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
      >
        {lost ? `−${value}` : "0"}
      </p>
      <p className="text-[10px] leading-tight text-muted-foreground">{note}</p>
    </div>
  );
}

function Bar({ value, max }: { value: number; max: number }) {
  // A zero draws nothing — a stub bar would read as "a little", and zero is the finding.
  if (value === 0 || max === 0) return null;
  const pct = Math.max(4, Math.round((value / max) * 100));
  return <span className="block h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} aria-hidden="true" />;
}

export default async function BookingsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; client?: string }>;
}) {
  const { status, client } = await searchParams;
  const { rows: allRows, kpi, byClient, bySource, unaccountedOpens, funnel } = await getBookingsReport();

  const rows = allRows.filter((r) => {
    if (status && r.status !== status) return false;
    if (client && r.clientName !== client) return false;
    return true;
  });

  const maxClient = byClient[0]?.total ?? 0;
  const maxSource = bySource[0]?.count ?? 0;

  const tab = (active: boolean) =>
    `rounded-md border px-3 py-1 text-xs transition ${
      active ? "border-foreground bg-foreground font-semibold text-background" : "border-input hover:bg-muted"
    }`;

  const q = (next: { status?: string; client?: string }) => {
    const p = new URLSearchParams();
    if (next.status) p.set("status", next.status);
    if (next.client) p.set("client", next.client);
    const s = p.toString();
    return `/analytics/leads/bookings${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Bookings report</h1>
          <p className="mt-1 text-muted-foreground">
            Last 90 days · from our database — every row is a real person you can call
          </p>
        </div>
        <Link href="/" className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
          ← Back to dashboard
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">New — needs contact</p>
            <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">{kpi.newCount}</p>
            <p className="text-[11px] text-muted-foreground">nobody has called them yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Contacted</p>
            <p className="text-2xl font-bold tabular-nums">{kpi.contacted}</p>
            <p className="text-[11px] text-muted-foreground">in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Done</p>
            <p className="text-2xl font-bold tabular-nums">{kpi.done}</p>
            <p className="text-[11px] text-muted-foreground">closed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Guest vs member</p>
            <p className="text-2xl font-bold tabular-nums">
              {kpi.guest} <span className="text-base font-normal text-muted-foreground">/ {kpi.member}</span>
            </p>
            <p className="text-[11px] text-muted-foreground">booked without an account / signed in</p>
          </CardContent>
        </Card>
        <Card className={kpi.pageOpens > 0 && kpi.total === 0 ? "border-t-4 border-t-red-500" : ""}>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Book page opened</p>
            <p className="text-2xl font-bold tabular-nums">{kpi.pageOpens}</p>
            <p className="text-[11px] text-muted-foreground">
              GA4 ·{" "}
              {kpi.pageOpens > 0
                ? `${Math.round((kpi.total / kpi.pageOpens) * 100)}% ended in a booking`
                : "no data"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* The funnel. Two gaps, two different problems — never collapse them into one. */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">The funnel — where people fall out</CardTitle>
          <p className="text-xs text-muted-foreground">
            opened the page → pressed submit → a row reached our database
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            <FunnelStep label="Opened the page" value={funnel.opened} source="GA4" />
            <FunnelGap
              value={funnel.opened - funnel.attempts}
              note="opened but never pressed submit"
            />
            <FunnelStep label="Pressed submit" value={funnel.attempts} source="GA4" />
            <FunnelGap value={funnel.attempts - funnel.booked} note="pressed but never saved" />
            <FunnelStep label="Booking saved" value={funnel.booked} source="our DB" good />
          </div>

          {funnel.attempts === 0 && funnel.opened > 0 && (
            <p className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
              No <code className="rounded bg-muted px-1">booking_attempt</code> events yet. The event ships
              with the pending modonty push — until it is live, the middle column stays at 0 and only the
              outer two numbers are real.
            </p>
          )}

          {funnel.failed.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold">Why the attempts died</p>
              <table className="w-full text-sm">
                <tbody>
                  {funnel.failed.map((f) => (
                    <tr key={f.reason} className="border-b last:border-0">
                      <td className="py-2 pe-3">
                        {FAIL_REASON_LABEL[f.reason] ?? f.reason}
                        <code className="ms-2 rounded bg-muted px-1.5 py-0.5 text-[11px]">{f.reason}</code>
                      </td>
                      <td className="py-2 text-end font-bold tabular-nums text-red-600 dark:text-red-400">
                        {f.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By client — opened vs booked</CardTitle>
            <p className="text-xs text-muted-foreground">
              opens come from GA4, bookings from our DB — the gap is money walking away
            </p>
          </CardHeader>
          <CardContent>
            {byClient.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No bookings and no book-page opens in the last 90 days
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-2 pe-3 text-start font-medium">Client</th>
                    <th className="py-2 pe-3 text-start font-medium">Opened</th>
                    <th className="py-2 pe-3 text-start font-medium">Booked</th>
                    <th className="py-2 pe-3 text-start font-medium">New</th>
                    <th className="py-2 text-start font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {byClient.map((c) => {
                    // A client with opens and nothing booked is the whole point of this table.
                    const leaking = (c.opened ?? 0) > 0 && c.total === 0;
                    const rate =
                      c.opened && c.opened > 0 ? `${Math.round((c.total / c.opened) * 100)}%` : "—";
                    return (
                      <tr key={c.name} className="border-b last:border-0">
                        <td className="py-2 pe-3 font-semibold">
                          <Link href={q({ client: c.name })} className="hover:underline">
                            {c.name}
                          </Link>
                        </td>
                        <td className="py-2 pe-3 tabular-nums">
                          {c.opened === null ? <span className="text-muted-foreground">—</span> : c.opened}
                        </td>
                        <td
                          className={`py-2 pe-3 font-bold tabular-nums ${leaking ? "text-red-600 dark:text-red-400" : ""}`}
                        >
                          {c.total}
                        </td>
                        <td className="py-2 pe-3">
                          {c.newCount > 0 ? (
                            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:text-red-400">
                              {c.newCount}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2">
                          {leaking ? (
                            <span className="font-semibold text-red-600 dark:text-red-400">0% — leak</span>
                          ) : (
                            <span className="tabular-nums text-muted-foreground">{rate}</span>
                          )}
                          <Bar value={c.total} max={maxClient} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By source — where they clicked</CardTitle>
            <p className="text-xs text-muted-foreground">tells you which surface actually converts</p>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pe-3 text-start font-medium">Surface</th>
                  <th className="py-2 pe-3 text-start font-medium">Bookings</th>
                  <th className="w-[35%] py-2 text-start font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {bySource.map((s) => (
                  <tr key={s.source} className="border-b last:border-0">
                    <td className="py-2 pe-3">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{s.source}</code>
                      <div className="text-[11px] text-muted-foreground">{SOURCE_LABEL[s.source] ?? "—"}</div>
                    </td>
                    <td className="py-2 pe-3 font-bold tabular-nums">{s.count}</td>
                    <td className="py-2">
                      <Bar value={s.count} max={maxSource} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {unaccountedOpens.length > 0 && (
        <Card className="border-amber-500/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Book-page views not tied to a live client ·{" "}
              {unaccountedOpens.reduce((a, b) => a + b.views, 0)} views
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              GA4 counted these but the slug is not a client we have. Renamed, deleted, or a stale URL —
              listed here so the totals reconcile instead of vanishing.
            </p>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pe-3 text-start font-medium">Path</th>
                  <th className="py-2 text-start font-medium">Views</th>
                </tr>
              </thead>
              <tbody>
                {unaccountedOpens.map((u) => (
                  <tr key={u.path} className="border-b last:border-0">
                    <td className="py-2 pe-3">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{u.path}</code>
                    </td>
                    <td className="py-2 font-bold tabular-nums">{u.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All bookings — newest first</CardTitle>
          <div className="flex flex-wrap gap-1.5 pt-2">
            <Link href={q({ client })} className={tab(!status)}>
              All {allRows.length}
            </Link>
            <Link href={q({ status: "new", client })} className={tab(status === "new")}>
              New {kpi.newCount}
            </Link>
            <Link href={q({ status: "contacted", client })} className={tab(status === "contacted")}>
              Contacted {kpi.contacted}
            </Link>
            <Link href={q({ status: "done", client })} className={tab(status === "done")}>
              Done {kpi.done}
            </Link>
            {client && (
              <Link href={q({ status })} className={tab(true)}>
                Client: {client} ✕
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No bookings match this filter</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-2 pe-3 text-start font-medium">Name</th>
                    <th className="py-2 pe-3 text-start font-medium">Contact</th>
                    <th className="py-2 pe-3 text-start font-medium">Client</th>
                    <th className="py-2 pe-3 text-start font-medium">From</th>
                    <th className="py-2 pe-3 text-start font-medium">Preferred</th>
                    <th className="py-2 pe-3 text-start font-medium">Visitor</th>
                    <th className="py-2 pe-3 text-start font-medium">Status</th>
                    <th className="py-2 text-start font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b align-top last:border-0">
                      <td className="py-2 pe-3 font-semibold">{r.name}</td>
                      <td className="py-2 pe-3">
                        <div dir="ltr" className="tabular-nums">
                          {r.phone}
                        </div>
                        {r.email && <div className="text-xs text-muted-foreground">{r.email}</div>}
                      </td>
                      <td className="py-2 pe-3">{r.clientName}</td>
                      <td className="max-w-[240px] py-2 pe-3">
                        {r.articleTitle && <div className="truncate text-xs text-muted-foreground">📄 {r.articleTitle}</div>}
                        <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{r.source}</code>
                        {r.message && <div className="line-clamp-2 pt-1 text-xs">{r.message}</div>}
                      </td>
                      <td className="whitespace-nowrap py-2 pe-3 text-xs tabular-nums">
                        {r.preferredAt ? fmt(r.preferredAt) : "—"}
                      </td>
                      <td className="py-2 pe-3">
                        {r.isMember ? (
                          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                            Member
                          </span>
                        ) : (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                            Guest
                          </span>
                        )}
                      </td>
                      <td className="py-2 pe-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="whitespace-nowrap py-2 text-xs tabular-nums text-muted-foreground">
                        {fmt(r.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
