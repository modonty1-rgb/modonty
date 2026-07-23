import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getBookingsReport } from "../../actions/get-bookings-report";
import { FAIL_REASON_LABEL } from "@/lib/analytics/book-funnel";

// Bookings & leads — rebuilt decision-first (Khalid 2026-07-23: «تديني حاجة أعرف
// أتخذ عليها قرار، مش صفحة فيها حشو»). The page answers ONE question: who needs
// contact now, and which clients are leaking (opens, zero bookings). Everything
// else (funnel, sources, reconciliation) is diagnostics — folded away, not deleted.

const SOURCE_LABEL: Record<string, string> = {
  article_dock: "sticky bar in an article",
  article_card: "article card",
  client_page: "client page",
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

function Bar({ value, max }: { value: number; max: number }) {
  if (value === 0 || max === 0) return null;
  const pct = Math.max(4, Math.round((value / max) * 100));
  return <span className="block h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} aria-hidden="true" />;
}

export default async function BookingsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; client?: string; channel?: string }>;
}) {
  const { status, client, channel } = await searchParams;
  const { rows: allRows, byClient, bySource, unaccountedOpens, funnel } = await getBookingsReport();

  const isWhatsApp = channel === "whatsapp";
  const scoped = channel ? allRows.filter((r) => r.channel === channel) : allRows;
  const rows = scoped.filter((r) => {
    if (status && r.status !== status) return false;
    if (client && r.clientName !== client) return false;
    return true;
  });

  const nNew = scoped.filter((r) => r.status === "new").length;
  const nContacted = scoped.filter((r) => r.status === "contacted").length;
  const nDone = scoped.filter((r) => r.status === "done").length;

  // Leaking clients — a FORM journey (book page opened, nothing booked). WhatsApp has
  // no page funnel, so this concept does not apply there.
  const leaks = isWhatsApp
    ? []
    : byClient.filter((c) => (c.opened ?? 0) > 0 && c.total === 0).sort((a, b) => (b.opened ?? 0) - (a.opened ?? 0));
  const maxLeak = leaks[0]?.opened ?? 0;

  // Merge-preserving query builder: change one facet, keep the rest. Pass `undefined` to drop one.
  const q = (next: { status?: string; client?: string; channel?: string }) => {
    const merged = { status, client, channel, ...next };
    const p = new URLSearchParams();
    if (merged.status) p.set("status", merged.status);
    if (merged.client) p.set("client", merged.client);
    if (merged.channel) p.set("channel", merged.channel);
    const s = p.toString();
    return `/analytics/leads/bookings${s ? `?${s}` : ""}`;
  };

  const tab = (active: boolean) =>
    `rounded-md border px-3 py-1 text-xs transition ${
      active ? "border-foreground bg-foreground font-semibold text-background" : "border-input hover:bg-muted"
    }`;

  return (
    <div className="mx-auto max-w-[1000px] space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Bookings &amp; leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Last 90 days · who to contact now and which clients are leaking
          </p>
        </div>
        <Link href="/" className="shrink-0 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
          ← Back to dashboard
        </Link>
      </div>

      {/* The decision — two numbers, not five. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-s-4 border-s-red-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Needs contact</p>
            <p className="text-3xl font-bold tabular-nums text-red-600 dark:text-red-400">{nNew}</p>
            <p className="text-[11px] text-muted-foreground">
              {isWhatsApp
                ? "new WhatsApp leads — the chat went to the client to follow up"
                : "new bookings nobody has called yet"}
            </p>
          </CardContent>
        </Card>

        {isWhatsApp ? (
          <Card className="border-s-4 border-s-[#25d366]">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">WhatsApp leads (90d)</p>
              <p className="text-3xl font-bold tabular-nums text-[#1a7f4b] dark:text-[#3ddc84]">{scoped.length}</p>
              <p className="text-[11px] text-muted-foreground">anonymous chats handed to clients</p>
            </CardContent>
          </Card>
        ) : (
          <Card className={`border-s-4 ${leaks.length ? "border-s-amber-500" : "border-s-emerald-500"}`}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Leaking clients</p>
              <p
                className={`text-3xl font-bold tabular-nums ${
                  leaks.length ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {leaks.length}
              </p>
              <p className="text-[11px] text-muted-foreground">book page opened, zero bookings — money walking away</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Leaking clients — the single most fixable loss. Only when there is one. */}
      {!isWhatsApp && leaks.length > 0 && (
        <Card className="border-amber-500/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leaking clients — fix these first</CardTitle>
            <p className="text-xs text-muted-foreground">
              real visits to their book page, nothing booked — usually a broken or missing contact button
            </p>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pe-3 text-start font-medium">Client</th>
                  <th className="py-2 pe-3 text-start font-medium">Opened</th>
                  <th className="w-[40%] py-2 text-start font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {leaks.map((c) => (
                  <tr key={c.name} className="border-b last:border-0">
                    <td className="py-2 pe-3 font-semibold">{c.name}</td>
                    <td className="py-2 pe-3 font-bold tabular-nums text-amber-600 dark:text-amber-400">{c.opened}</td>
                    <td className="py-2">
                      <Bar value={c.opened ?? 0} max={maxLeak} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* The leads — the act-now list. Defaults to everything; New tab is the queue. */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {isWhatsApp ? "WhatsApp leads — which clients got them" : "Leads"}
          </CardTitle>
          {isWhatsApp && (
            <p className="text-xs text-muted-foreground">
              anonymous — the chat is the contact, so there is no name or phone. This is who each client received.
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 pt-2">
            <Link href={q({ status: undefined })} className={tab(!status)}>
              All {scoped.length}
            </Link>
            <Link href={q({ status: "new" })} className={tab(status === "new")}>
              New {nNew}
            </Link>
            <Link href={q({ status: "contacted" })} className={tab(status === "contacted")}>
              Contacted {nContacted}
            </Link>
            <Link href={q({ status: "done" })} className={tab(status === "done")}>
              Done {nDone}
            </Link>
            {client && (
              <Link href={q({ client: undefined })} className={tab(true)}>
                Client: {client} ✕
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No leads match this filter</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-2 pe-3 text-start font-medium">Lead</th>
                    <th className="py-2 pe-3 text-start font-medium">Client</th>
                    <th className="py-2 pe-3 text-start font-medium">Contact</th>
                    <th className="py-2 pe-3 text-start font-medium">Source</th>
                    <th className="py-2 pe-3 text-start font-medium">When</th>
                    <th className="py-2 text-start font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b align-top last:border-0">
                      <td className="py-2 pe-3 font-semibold">
                        {r.name ?? (
                          <span className="font-normal text-muted-foreground">
                            {r.channel === "whatsapp" ? "WhatsApp lead" : "—"}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pe-3">{r.clientName}</td>
                      <td className="py-2 pe-3">
                        {r.phone ? (
                          <div dir="ltr" className="tabular-nums">
                            {r.phone}
                          </div>
                        ) : r.channel === "whatsapp" ? (
                          <span className="rounded-full bg-[#25d366]/15 px-2 py-0.5 text-[11px] font-semibold text-[#1a7f4b] dark:text-[#3ddc84]">
                            via WhatsApp
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                        {r.email && <div className="text-xs text-muted-foreground">{r.email}</div>}
                      </td>
                      <td className="py-2 pe-3">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{r.source}</code>
                        <div className="text-[11px] text-muted-foreground">{SOURCE_LABEL[r.source] ?? "—"}</div>
                      </td>
                      <td className="whitespace-nowrap py-2 pe-3 text-xs tabular-nums text-muted-foreground">
                        {fmt(r.createdAt)}
                      </td>
                      <td className="py-2">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnostics — folded away. The funnel is a FORM journey, so it stays hidden for WhatsApp. */}
      {!isWhatsApp && (
        <details className="group rounded-xl border bg-card">
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold">
            More analysis — funnel, sources &amp; reconciliation
            <span className="text-xs font-normal text-muted-foreground group-open:hidden">show</span>
            <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">hide</span>
          </summary>

          <div className="space-y-5 border-t p-4">
            {/* Funnel */}
            <div>
              <p className="text-sm font-semibold">The funnel — where people fall out</p>
              <p className="mb-3 text-xs text-muted-foreground">opened the page → pressed submit → saved</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border p-3">
                  <p className="text-2xl font-bold tabular-nums">{funnel.opened}</p>
                  <p className="text-[11px] text-muted-foreground">opened · GA4</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-2xl font-bold tabular-nums">{funnel.attempts}</p>
                  <p className="text-[11px] text-muted-foreground">pressed submit · GA4</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {funnel.booked}
                  </p>
                  <p className="text-[11px] text-muted-foreground">saved · our DB</p>
                </div>
              </div>
              {funnel.attempts === 0 && funnel.opened > 0 && (
                <p className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-[11px]">
                  No <code className="rounded bg-muted px-1">booking_attempt</code> events yet (ships with the pending
                  modonty push) — until then the middle number stays 0.
                </p>
              )}
              {funnel.failed.length > 0 && (
                <table className="mt-3 w-full text-sm">
                  <tbody>
                    {funnel.failed.map((f) => (
                      <tr key={f.reason} className="border-b last:border-0">
                        <td className="py-1.5 pe-3">{FAIL_REASON_LABEL[f.reason] ?? f.reason}</td>
                        <td className="py-1.5 text-end font-bold tabular-nums text-red-600 dark:text-red-400">
                          {f.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* By source */}
            <div>
              <p className="mb-2 text-sm font-semibold">By source — which surface converts</p>
              <table className="w-full text-sm">
                <tbody>
                  {bySource.map((s) => (
                    <tr key={s.source} className="border-b last:border-0">
                      <td className="py-1.5 pe-3">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{s.source}</code>
                        <span className="ms-2 text-[11px] text-muted-foreground">{SOURCE_LABEL[s.source] ?? "—"}</span>
                      </td>
                      <td className="py-1.5 text-end font-bold tabular-nums">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Unaccounted opens */}
            {unaccountedOpens.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold">
                  Book-page views not tied to a live client ·{" "}
                  {unaccountedOpens.reduce((a, b) => a + b.views, 0)} views
                </p>
                <table className="w-full text-sm">
                  <tbody>
                    {unaccountedOpens.map((u) => (
                      <tr key={u.path} className="border-b last:border-0">
                        <td className="py-1.5 pe-3">
                          <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{u.path}</code>
                        </td>
                        <td className="py-1.5 text-end font-bold tabular-nums">{u.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
