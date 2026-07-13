import Link from "next/link";
import { FileCheck, FileText, FileX, type LucideIcon } from "lucide-react";
import { ArticleStatus } from "@prisma/client";

import { articleStatusCounts } from "@/lib/dashboard/cached";
import { CARD_GRID, Ghost, SectionHead, TierCard, ZChip, type Tier } from "../dashboard-ui";

/**
 * The article pipeline (contract: admin-dashboard-triage-v2-ui.html).
 * Live stages get a card; empty stages compress into one ghost cell — a zero is good
 * news and earns a chip, not a card (Khalid: «المساحات الفاضية»).
 */

const STAGES: Array<{
  status: ArticleStatus;
  key: string;
  label: string;
  note: string;
  tier: Tier;
  icon: LucideIcon;
}> = [
  {
    status: ArticleStatus.AWAITING_APPROVAL,
    key: "awaiting-approval",
    label: "Waiting approval",
    note: "your sign-off is the blocker",
    tier: "warm",
    icon: FileCheck,
  },
  {
    status: ArticleStatus.NEEDS_REVISION,
    key: "needs-revision",
    label: "Need revision",
    note: "sent back — fix and resubmit",
    tier: "warm",
    icon: FileX,
  },
  {
    status: ArticleStatus.DRAFT,
    key: "draft",
    label: "Drafts",
    note: "being written now",
    tier: "plain",
    icon: FileText,
  },
  {
    status: ArticleStatus.WRITING,
    key: "writing",
    label: "Being written",
    note: "in the writer's hands",
    tier: "plain",
    icon: FileText,
  },
  {
    status: ArticleStatus.SCHEDULED,
    key: "scheduled",
    label: "Scheduled",
    note: "queued to go live",
    tier: "plain",
    icon: FileText,
  },
  {
    status: ArticleStatus.PUBLISHED,
    key: "published",
    label: "Published",
    note: "live on modonty.com",
    tier: "ok",
    icon: FileCheck,
  },
  {
    status: ArticleStatus.ARCHIVED,
    key: "archived",
    label: "Archived",
    note: "off the site",
    tier: "plain",
    icon: FileX,
  },
];

export async function ArticlesPipeline() {
  const counts = await articleStatusCounts();
  const total = STAGES.reduce((sum, s) => sum + counts[s.status], 0);
  const needDecision = counts[ArticleStatus.AWAITING_APPROVAL] + counts[ArticleStatus.NEEDS_REVISION];

  const live = STAGES.filter((s) => counts[s.status] > 0);
  const empty = STAGES.filter((s) => counts[s.status] === 0);

  return (
    <div>
      <SectionHead
        icon={FileText}
        title="Articles"
        subtitle="every stage of the pipeline"
        right={
          <Link
            href="/articles"
            className="flex items-baseline gap-2 text-xs text-muted-foreground hover:underline"
          >
            <span
              className={`text-base font-bold tabular-nums ${
                needDecision > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {needDecision}
            </span>
            need a decision
            <span className="text-muted-foreground/40">·</span>
            {total.toLocaleString("en-US")} total
            <span className="text-primary">→</span>
          </Link>
        }
      />

      <div className={CARD_GRID}>
        {live.map((s) => (
          <TierCard
            key={s.status}
            href={`/articles/segment/${s.key}`}
            tier={s.tier}
            icon={s.icon}
            value={counts[s.status]}
            label={s.label}
            note={s.note}
          />
        ))}
        {empty.length > 0 && (
          <Ghost title="Empty stages">
            {empty.map((s) => (
              <ZChip key={s.status}>
                <b className="font-bold text-foreground">0</b> {s.label.toLowerCase()}
              </ZChip>
            ))}
          </Ghost>
        )}
      </div>
    </div>
  );
}
