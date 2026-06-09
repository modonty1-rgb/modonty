import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getClientReviews,
  getClientReviewStats,
} from "./helpers/client-review-queries";
import { ClientReviewsTable } from "./components/client-reviews-table";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, Trash2, Star, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientReviewsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const [reviews, stats] = await Promise.all([
    getClientReviews(clientId),
    getClientReviewStats(clientId),
  ]);

  const avg = stats.averageRating;
  const avgLabel = avg > 0 ? avg.toFixed(1) : "—";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          تقييمات نشاطك
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          تقييمات الزوار لخدمتك (نجوم + رأي). وافق أو ارفض قبل الظهور.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="text-xs leading-relaxed text-foreground">
            كل تقييم ينحفظ «بانتظار المراجعة» حتى توافق عليه — ثم يظهر في صفحة
            نشاطك ويُحسب ضمن متوسط التقييم العام. الزائر يقيّم مرة وحدة بس.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Kpi
          icon={Star}
          tone="gold"
          label="متوسط التقييم"
          value={avgLabel}
          suffix={avg > 0 ? "/ 5" : undefined}
        />
        <Kpi icon={Clock} tone="amber" label="بانتظار" value={stats.pending} />
        <Kpi icon={CheckCircle} tone="emerald" label="معتمد" value={stats.approved} />
        <Kpi icon={XCircle} tone="red" label="مرفوض" value={stats.rejected} />
        <Kpi icon={Trash2} tone="slate" label="محذوف" value={stats.deleted} />
      </div>

      <ClientReviewsTable reviews={reviews} />
    </div>
  );
}

function Kpi({
  icon: Icon,
  tone,
  label,
  value,
  suffix,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "amber" | "emerald" | "red" | "slate" | "gold";
  label: string;
  value: number | string;
  suffix?: string;
}) {
  const cls = {
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
    gold: "bg-[#f5a623]/10 text-[#b9760a] ring-[#f5a623]/30",
  }[tone];
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${cls}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-tight tabular-nums">
            {value}
            {suffix && (
              <span className="text-sm font-normal text-muted-foreground"> {suffix}</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
