import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import type { ClientSiteRow } from "../helpers/load-client-articles";

function formatDate(value: Date | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(value);
}

/** Delivery state in one word — the thing that decides whether their site reads at all. */
function DeliveryBadge({ row }: { row: ClientSiteRow }) {
  if (row.keySuspended) {
    return <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-destructive">Suspended</span>;
  }
  return <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-600">Active</span>;
}

export function ClientArticlesTable({ rows }: { rows: ClientSiteRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">No client is publishing to their own site yet.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Open a client, go to <b>Client Site &amp; API</b>, switch publishing on and add their articles address.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-start font-medium">Client</th>
            <th className="px-3 py-2 text-start font-medium">Articles address</th>
            <th className="px-3 py-2 text-start font-medium">Delivery</th>
            <th className="px-3 py-2 text-start font-medium">Articles</th>
            <th className="px-3 py-2 text-start font-medium">Live</th>
            {/* The column that exposes an integration that broke in silence. */}
            <th className="px-3 py-2 text-start font-medium">Last fetch</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t hover:bg-muted/30">
              <td className="px-3 py-2 whitespace-nowrap font-medium">
                <Link href={`/client-articles/${row.id}`} className="hover:underline">
                  {row.name}
                </Link>
              </td>
              <td className="px-3 py-2">
                <code dir="ltr" className="block max-w-[280px] truncate font-mono text-[11px] text-muted-foreground">
                  {row.articlesBaseUrl || "—"}
                </code>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs">
                <DeliveryBadge row={row} />
              </td>
              <td className="px-3 py-2 whitespace-nowrap tabular-nums">{row.totalArticles}</td>
              <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                {row.liveArticles}
                {row.neverFetched > 0 && (
                  <span
                    className="ms-1.5 inline-flex items-center gap-1 text-xs text-amber-600"
                    title="Live on our side, but their website has never fetched them"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {row.neverFetched}
                  </span>
                )}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                {formatDate(row.apiKeyLastUsedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
