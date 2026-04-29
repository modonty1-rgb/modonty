import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { redirect } from "next/navigation";
import {
  getClientComments,
  getCommentStats,
  type CommentStats,
} from "./helpers/comment-queries";
import { CommentsTable } from "./components/comments-table";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CommentsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const [comments, stats] = await Promise.all([
    getClientComments(clientId),
    getCommentStats(clientId),
  ]);

  const c = ar.comments;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {c.title}
        </h1>
        <p className="text-muted-foreground mt-1">{c.reviewModerate}</p>
      </header>

      <KpiGrid stats={stats} />

      <CommentsTable comments={comments} />
    </div>
  );
}

// ─── KPI Grid ────────────────────────────────────────────────────────

function KpiGrid({ stats }: { stats: CommentStats }) {
  const c = ar.comments;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        icon={Clock}
        tone="amber"
        label={c.pending}
        value={stats.pending}
        hint={c.awaitingReview}
      />
      <KpiCard
        icon={CheckCircle}
        tone="emerald"
        label={c.approved}
        value={stats.approved}
        hint={c.publishedComments}
      />
      <KpiCard
        icon={XCircle}
        tone="red"
        label={c.rejected}
        value={stats.rejected}
        hint={c.rejectedComments}
      />
      <KpiCard
        icon={Trash2}
        tone="slate"
        label={c.deletedKpi}
        value={stats.deleted}
        hint={c.deletedHint}
      />
      <KpiCard
        icon={MessageSquare}
        tone="muted"
        label={c.total}
        value={stats.total}
        hint={c.activeOnly}
      />
    </div>
  );
}

function KpiCard({
  icon: Icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "amber" | "emerald" | "red" | "slate" | "muted";
  label: string;
  value: number;
  hint: string;
}) {
  const toneClasses = {
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
    muted: "bg-muted text-muted-foreground ring-border",
  }[tone];
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${toneClasses}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-tight tabular-nums">
            {value}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
