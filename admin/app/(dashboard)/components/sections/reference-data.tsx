import { Building2, FolderTree, Tag, User, type LucideIcon } from "lucide-react";

const LABEL: Record<ReferenceGroup["key"], string> = { categories: "الفئات", tags: "الوسوم", industries: "الصناعات", authors: "الكتّاب" };

import type { ReferenceGroup } from "../../actions/reference-seo-counts";
import { referenceSeoCounts } from "@/lib/dashboard/cached";
import { CARD_GRID, TierCard } from "../dashboard-ui";
import { PanelHead } from "../panel-head";

/**
 * Reference data. Four indexed listing
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
  const groups = await referenceSeoCounts();
  const totalFailing = groups.reduce((s, g) => s + g.failing, 0);

  return (
    <>
      <PanelHead
        title="الفئات والوسوم"
        hint="+ الصناعات والكتّاب — صفحات قوائم مؤرشفة"
        right={
          <p className="text-xs text-muted-foreground">
            <span
              className={`text-base font-bold tabular-nums ${
                totalFailing > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {totalFailing}
            </span>{" "}
            تحت 60
          </p>
        }
      />
      <div className={CARD_GRID}>
        {groups.map((g) => (
          <TierCard
            key={g.key}
            href={`/reference/segment/${g.key}`}
            tier={g.failing > 0 ? "warm" : "ok"}
            icon={ICON[g.key]}
            value={g.total}
            label={LABEL[g.key]}
            note={
              g.failing > 0
                ? g.failing === g.total
                  ? `كلها ${g.total} تفشل — ما تولّد شي`
                  : `${g.failing} من ${g.total} تحت 60`
                : `كلها ${g.total} سليمة`
            }
          />
        ))}
      </div>
    </>
  );
}
