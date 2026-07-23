import { Building2, FolderTree, Tag, User, type LucideIcon } from "lucide-react";

import { getReferenceSeoCounts, type ReferenceGroup } from "../../actions/reference-seo-counts";
import { CARD_GRID, SummaryChip, TierCard } from "../dashboard-ui";
import { CollapsibleSection } from "../collapsible-section";

/**
 * Reference data (contract: admin-dashboard-triage-v2-ui.html). Four indexed listing
 * groups nobody ever checks. Each one is named on its own card — a broken group is
 * amber (SEO is this-week work), a healthy group is green — so it is always clear
 * exactly what is tracked, not just what is broken.
 */

const ICON: Record<ReferenceGroup["key"], LucideIcon> = {
  categories: FolderTree,
  tags: Tag,
  industries: Building2,
  authors: User,
};

export async function ReferenceData() {
  const groups = await getReferenceSeoCounts();
  const totalFailing = groups.reduce((s, g) => s + g.failing, 0);

  return (
    <CollapsibleSection
      iconNode={<FolderTree className="h-4 w-4 text-muted-foreground" />}
      title="Categories & tags"
      subtitle="+ industries & authors — indexed listing pages"
      storageKey="dashReferenceOpen"
      summary={groups.map((g) => (
        <SummaryChip key={g.key} icon={ICON[g.key]} value={g.total} tier={g.failing > 0 ? "warm" : "ok"} />
      ))}
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
    >
      <div className={CARD_GRID}>
        {groups.map((g) => (
          <TierCard
            key={g.key}
            href={`/reference/segment/${g.key}`}
            tier={g.failing > 0 ? "warm" : "ok"}
            icon={ICON[g.key]}
            value={g.total}
            label={g.label}
            note={
              g.failing > 0
                ? g.failing === g.total
                  ? `all ${g.total} failing — nothing generated`
                  : `${g.failing} of ${g.total} below 60`
                : `all ${g.total} healthy ✓`
            }
          />
        ))}
      </div>
    </CollapsibleSection>
  );
}
