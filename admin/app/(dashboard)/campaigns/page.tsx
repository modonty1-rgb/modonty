import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { CampaignAlerts } from "./components/campaign-alerts";
import { CampaignCard } from "./components/campaign-card";
import { STAGES, STAGE_LABEL, briefStage, type BriefStage } from "./helpers/brief-stage";
import { buildCampaignBoard } from "./helpers/build-campaign-board";
import { getCampaigns } from "./helpers/get-campaigns";
import { getSalesResults } from "./helpers/get-sales-results";

export const metadata = { title: "الحملات" };

const ar = new Intl.NumberFormat("ar-EG");

/**
 * الحملات — بريفات الميديا باير وموافقة الأدمن، وأرقام ميتا بجانب كلّ بريف (خالد ٢٩ سبتمبر ٢٠٢٦).
 *
 * التبويب الافتراضيّ «بانتظار الموافقة» متى كان فيه شيء: هو ما يحتاج قراراً اليوم. والتنبيهات فوق
 * الكلّ لأنها صرفٌ يحدث الآن بلا ما وُوفق عليه.
 */
export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [rows, admin, params] = await Promise.all([getCampaigns(), checkFinanceAdmin(), searchParams]);
  const [{ metaByBrief, alerts, metaErrors }, salesByBrief] = await Promise.all([
    buildCampaignBoard(rows),
    getSalesResults(rows.filter((r) => r._count.leads > 0).map((r) => r.id)),
  ]);
  const canDecide = admin.status === "ok";

  const stageOf = new Map(rows.map((r) => [r.id, briefStage(r)]));
  const counts = Object.fromEntries(STAGES.map((t) => [t, rows.filter((r) => stageOf.get(r.id) === t).length])) as Record<BriefStage, number>;
  const requested = STAGES.find((t) => t === params.tab);
  // What needs a decision first, then what waits to be switched on, then what runs.
  const tab: BriefStage = requested ?? (counts.PENDING > 0 ? "PENDING" : counts.APPROVED > 0 ? "APPROVED" : "RUNNING");
  const visible = rows.filter((r) => stageOf.get(r.id) === tab);

  return (
    <div dir="rtl" className="space-y-3">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold tracking-[-0.01em]">الحملات</h1>
        <Button asChild size="sm" className="ms-auto h-8 gap-1.5 rounded">
          <Link href="/campaigns/new">
            <Plus className="size-4" aria-hidden /> بريف جديد
          </Link>
        </Button>
      </div>

      <CampaignAlerts alerts={alerts} metaErrors={metaErrors} />

      <nav aria-label="حالة الحملة" className="flex flex-wrap gap-1.5">
        {STAGES.map((t) => (
          <Link
            key={t}
            href={`/campaigns?tab=${t}`}
            aria-current={tab === t ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
              tab === t ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {STAGE_LABEL[t]}
            <span className="tabular-nums opacity-80">{ar.format(counts[t])}</span>
          </Link>
        ))}
      </nav>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <Megaphone className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">{tab === "PENDING" ? "لا بريف ينتظر الموافقة" : `لا حملات ${STAGE_LABEL[tab]}`}</p>
          <p className="mt-1 text-xs text-muted-foreground">البريف يكتبه الميديا باير قبل أن يبني الإعلان، ثم يُوافَق عليه هنا.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((row) => (
            <li key={row.id}>
              <CampaignCard row={row} meta={metaByBrief.get(row.id) ?? null} sales={salesByBrief.get(row.id) ?? null} canDecide={canDecide} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
