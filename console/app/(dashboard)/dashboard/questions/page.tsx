import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { redirect } from "next/navigation";
import {
  getClientVisitorQuestions,
  getVisitorQuestionStats,
  type QuestionStats,
} from "./helpers/question-queries";
import { QuestionsTable } from "./components/questions-table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Info,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const [questions, stats] = await Promise.all([
    getClientVisitorQuestions(clientId),
    getVisitorQuestionStats(clientId),
  ]);

  const q = ar.questions;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {q.title}
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">{q.description}</p>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="text-xs leading-relaxed text-foreground">{q.pageHint}</p>
        </div>
      </header>

      <KpiGrid stats={stats} />

      <QuestionsTable questions={questions} />
    </div>
  );
}

// ─── KPI Grid ────────────────────────────────────────────────────────

function KpiGrid({ stats }: { stats: QuestionStats }) {
  const q = ar.questions;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      <KpiCard
        icon={Clock}
        tone="amber"
        label={q.pending}
        value={stats.pending}
        hint={q.awaitingReply}
      />
      <KpiCard
        icon={CheckCircle}
        tone="emerald"
        label={q.answered}
        value={stats.answered}
        hint={q.publishedReplies}
      />
      <KpiCard
        icon={XCircle}
        tone="red"
        label={q.rejected}
        value={stats.rejected}
        hint={q.rejectedHint}
      />
      <KpiCard
        icon={MessageSquare}
        tone="muted"
        label={q.total}
        value={stats.total}
        hint={q.allQuestions}
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
  tone: "amber" | "emerald" | "red" | "muted";
  label: string;
  value: number;
  hint: string;
}) {
  const toneClasses = {
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    red: "bg-red-50 text-red-700 ring-red-200",
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
