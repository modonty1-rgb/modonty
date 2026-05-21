import Link from "next/link";
import {
  FileEdit,
  FileClock,
  FilePen,
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Archive,
  Newspaper,
} from "lucide-react";
import type { ArticleStatusCounts } from "../../actions/article-status-counts";
import { getArticleStatusCounts } from "../../actions/article-status-counts";
import { DashboardSection } from "../dashboard-section";

interface StatusCardConfig {
  key: keyof ArticleStatusCounts;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  toneClasses: string;
}

const STATUS_CARDS: StatusCardConfig[] = [
  {
    key: "WRITING",
    label: "Writing",
    hint: "Drafts in progress",
    icon: FilePen,
    toneClasses:
      "border-violet-500/30 bg-violet-500/[0.04] text-violet-600 dark:text-violet-400",
  },
  {
    key: "DRAFT",
    label: "Draft",
    hint: "Ready for review",
    icon: FileEdit,
    toneClasses:
      "border-amber-500/30 bg-amber-500/[0.04] text-amber-600 dark:text-amber-400",
  },
  {
    key: "AWAITING_APPROVAL",
    label: "Awaiting Approval",
    hint: "Client review pending",
    icon: FileClock,
    toneClasses:
      "border-blue-500/30 bg-blue-500/[0.04] text-blue-600 dark:text-blue-400",
  },
  {
    key: "NEEDS_REVISION",
    label: "Needs Revision",
    hint: "Client sent back",
    icon: AlertCircle,
    toneClasses:
      "border-red-500/30 bg-red-500/[0.04] text-red-600 dark:text-red-400",
  },
  {
    key: "SCHEDULED",
    label: "Scheduled",
    hint: "Future publish date",
    icon: CalendarClock,
    toneClasses:
      "border-cyan-500/30 bg-cyan-500/[0.04] text-cyan-600 dark:text-cyan-400",
  },
  {
    key: "PUBLISHED",
    label: "Published",
    hint: "Live on modonty.com",
    icon: CheckCircle2,
    toneClasses:
      "border-emerald-500/30 bg-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "ARCHIVED",
    label: "Archived",
    hint: "Removed from site",
    icon: Archive,
    toneClasses:
      "border-slate-500/30 bg-slate-500/[0.04] text-slate-500 dark:text-slate-400",
  },
];

export async function ArticleWorkflowBoard() {
  const counts = await getArticleStatusCounts();
  const total = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <DashboardSection
      title="Article Workflow"
      subtitle={`Live counts across all clients · ${total.toLocaleString()} articles total`}
      icon={<Newspaper className="h-5 w-5" />}
      accent="blue"
      drillDown={{ href: "/articles", label: "All Articles" }}
    >
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {STATUS_CARDS.map((card) => {
          const count = counts[card.key];
          const Icon = card.icon;
          return (
            <Link
              key={card.key}
              href={`/articles?status=${card.key}`}
              className={`relative rounded-lg border ${card.toneClasses} p-3 transition-all hover:scale-[1.02] hover:shadow-sm group`}
            >
              <div className="flex items-center justify-between gap-2">
                <Icon className="h-4 w-4 shrink-0 opacity-70" />
                <span className="text-2xl font-semibold tabular-nums leading-none">
                  {count.toLocaleString()}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-foreground/90">{card.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{card.hint}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </DashboardSection>
  );
}
