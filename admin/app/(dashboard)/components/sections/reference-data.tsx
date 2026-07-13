import Link from "next/link";
import { Database, User } from "lucide-react";

import { getReferenceSeoCounts } from "../../actions/reference-seo-counts";
import { Ghost, SectionHead, TierCard, ZChip } from "../dashboard-ui";

/**
 * Reference data (contract: admin-dashboard-triage-v2-ui.html). These are real indexed
 * pages nobody ever checks — so only a BROKEN group earns a card (amber: SEO is
 * this-week work, not a fire). Healthy groups collapse to green chips in the ghost cell.
 */

export async function ReferenceData() {
  const groups = await getReferenceSeoCounts();
  const totalFailing = groups.reduce((s, g) => s + g.failing, 0);

  const broken = groups.filter((g) => g.failing > 0);
  const healthy = groups.filter((g) => g.failing === 0);

  return (
    <div>
      <SectionHead
        icon={Database}
        title="Reference data"
        subtitle="indexed listing pages"
        right={
          <p className="text-xs text-muted-foreground">
            <span
              className={`text-base font-bold tabular-nums ${
                totalFailing > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {totalFailing}
            </span>{" "}
            below 60
          </p>
        }
      />

      <div className="grid grid-cols-2 gap-2.5">
        {broken.map((g) => (
          <TierCard
            key={g.key}
            href={`/reference/segment/${g.key}`}
            tier="warm"
            icon={User}
            value={g.failing}
            label={g.label}
            note={
              g.failing === g.total
                ? `all ${g.total} failing — nothing generated`
                : `${g.failing} of ${g.total} below 60`
            }
          />
        ))}
        {healthy.length > 0 && (
          <Ghost title="Healthy">
            {healthy.map((g) => (
              <Link key={g.key} href={`/reference/segment/${g.key}`} className="hover:opacity-80">
                <ZChip good>
                  <b className="font-bold">{g.total}</b> {g.label.toLowerCase()} ✓
                </ZChip>
              </Link>
            ))}
          </Ghost>
        )}
      </div>
    </div>
  );
}
