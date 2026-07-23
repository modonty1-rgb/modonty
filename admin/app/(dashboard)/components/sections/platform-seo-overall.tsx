import { GoogleIcon } from "@/components/admin/icons/google-icon";
import { articleSeoQuality, clientSeoQuality } from "@/lib/dashboard/cached";
import type { Tier } from "../dashboard-ui";
import { NUM } from "../pipeline-row";

/**
 * The ONE number for the whole platform (Khalid 2026-07-23): Modonty's overall SEO health,
 * pinned at the very top of the dashboard.
 *
 * Exact and honest — every scored entity counts once:
 *   (sum of ALL article scores + sum of ALL client scores) ÷ (articles + clients).
 * Averaging the two section averages would over-weight whichever set is smaller; scoring
 * runs through the SAME shared rubric both sections use, so this number and theirs agree.
 */
export async function PlatformSeoOverall() {
  const [articles, clients] = await Promise.all([articleSeoQuality(), clientSeoQuality()]);

  const nArticles = articles.perfect + articles.below;
  const nClients = clients.perfect + clients.below;
  const total = nArticles + nClients;
  if (total === 0) return null;

  const pct = Math.round((articles.sumScore + clients.sumScore) / total);
  const tier: Tier = pct >= 80 ? "ok" : pct >= 50 ? "warm" : "hot";

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] via-transparent to-transparent p-5 shadow-sm ring-1 ring-primary/10">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <GoogleIcon className="h-9 w-9 shrink-0" />
        <div className="shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Modonty · overall SEO
          </p>
          <span className={`text-5xl font-extrabold leading-none tabular-nums ${NUM[tier]}`}>
            {pct}%
          </span>
        </div>
        <div
          className="flex h-2.5 min-w-[80px] flex-1 overflow-hidden rounded-full bg-red-500/20"
          role="img"
          aria-label={`Overall SEO ${pct}%`}
        >
          <div className="bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="shrink-0 text-[12px] text-muted-foreground">
          {nArticles.toLocaleString("en-US")} articles · {nClients.toLocaleString("en-US")} clients
        </span>
      </div>
    </div>
  );
}
