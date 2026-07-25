import type { LucideIcon } from "lucide-react";
import { Send, MailCheck, UserPlus, ShieldAlert, MailX } from "lucide-react";

import { newsSubscriberCounts } from "@/lib/dashboard/cached";
import { SummaryChip } from "../dashboard-ui";
import { CollapsibleSection } from "../collapsible-section";

/**
 * Modonty's OWN newsletter (`NewsSubscriber`) — separate from per-client subscribers.
 * Display-only for now (no admin management page yet), so the stat cells don't link.
 */

type Tone = "ok" | "warm" | "plain";

function StatCell({
  icon: Icon,
  value,
  label,
  note,
  tone,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  note: string;
  tone: Tone;
}) {
  const top = tone === "ok" ? "border-t-emerald-500/40" : tone === "warm" ? "border-t-amber-500/50" : "border-t-border";
  const box =
    tone === "ok"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : tone === "warm"
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "bg-muted text-muted-foreground";
  return (
    <div className={`flex flex-col rounded-xl border border-t-2 bg-card p-3 ${top}`}>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${box}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-2xl font-bold leading-none tabular-nums">{value.toLocaleString("en-US")}</span>
      </div>
      <p className="pt-2 text-[11px] font-semibold leading-tight">{label}</p>
      <p className="pt-0.5 text-[10px] leading-snug text-muted-foreground">{note}</p>
    </div>
  );
}

export async function NewsletterPipeline() {
  const { total, active, unsubscribed, newLast30, noConsent } = await newsSubscriberCounts();

  return (
    <CollapsibleSection
      iconNode={<Send className="h-4 w-4 text-muted-foreground" />}
      title="Modonty Newsletter"
      subtitle="نشرة مدوّنتي — مشتركون عامّون (منفصلون عن مشتركي العملاء)"
      storageKey="dashNewsletterOpen"
      summary={
        <>
          <SummaryChip icon={MailCheck} value={active} tier={active > 0 ? "ok" : "plain"} />
          <SummaryChip icon={UserPlus} value={newLast30} tier="plain" />
          <SummaryChip icon={ShieldAlert} value={noConsent} tier={noConsent > 0 ? "warm" : "ok"} />
          <SummaryChip icon={MailX} value={unsubscribed} tier="plain" />
        </>
      }
      right={
        <span className="flex items-baseline gap-2 text-xs text-muted-foreground">
          <span className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {active.toLocaleString("en-US")}
          </span>
          نشط
          <span className="text-muted-foreground/40">·</span>
          {total.toLocaleString("en-US")} إجمالي
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <StatCell icon={MailCheck} value={active} label="نشط" note="مشترك وما ألغى" tone="ok" />
        <StatCell icon={UserPlus} value={newLast30} label="جديد هذا الشهر" note="آخر ٣٠ يوم" tone="plain" />
        <StatCell icon={ShieldAlert} value={noConsent} label="بلا موافقة مسجّلة" note="سجّل الموافقة قبل الإرسال" tone={noConsent > 0 ? "warm" : "ok"} />
        <StatCell icon={MailX} value={unsubscribed} label="ألغى الاشتراك" note="محفوظ للسجل" tone="plain" />
      </div>
    </CollapsibleSection>
  );
}
