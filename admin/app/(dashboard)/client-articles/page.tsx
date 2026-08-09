import { ClientArticlesTable } from "./components/client-articles-table";
import { getClientSiteRows } from "./helpers/load-client-articles";

// «Client Articles» — articles we write that get published on the CLIENT's own domain,
// never on modonty.com.
//
// The list is of CLIENTS, not articles (Khalid 2026-08-08). The destination is a
// property of the client: you decide who publishes on their own site, and writing for
// them only means something after that. So the client is the door — pick one, and their
// articles are behind it.
//
// There is no "new article" button here for the same reason: an article has to belong
// to a client before it can have a destination.

export default async function ClientArticlesPage() {
  const rows = await getClientSiteRows();

  const broken = rows.filter((r) => r.neverFetched > 0).length;

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Client Articles</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Clients whose articles are published on their own website — never on modonty.com.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <Pill label="Enabled clients" value={rows.length} tone="muted" />
          {broken > 0 && <Pill label="Never fetched" value={broken} tone="amber" />}
        </div>
      </div>

      <ClientArticlesTable rows={rows} />
    </div>
  );
}

function Pill({ label, value, tone }: { label: string; value: number; tone: "emerald" | "amber" | "muted" }) {
  const tones = {
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    muted: "bg-muted text-muted-foreground",
  } as const;
  return (
    <span className={`rounded-full px-2.5 py-1 font-medium ${tones[tone]}`}>
      {label} <b>{value}</b>
    </span>
  );
}
