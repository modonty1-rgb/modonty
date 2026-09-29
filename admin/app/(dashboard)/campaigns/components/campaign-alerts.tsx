import Link from "next/link";
import { AlertTriangle, ChevronDown } from "lucide-react";

import { currencyLabel } from "@modonty/shared/lib/commercial/format-money";
import type { CampaignAlert } from "../helpers/build-campaign-board";

const ar = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });

/**
 * ما يحتاج عين الأدمن — أربعة أنواع فقط (خالد ٢٩ سبتمبر ٢٠٢٦): صرفٌ بلا موافقة، وصرفٌ بعد الإيقاف،
 * وتجاوزُ سقف، وتكلفةُ عميلٍ فوق المستهدف. لا يظهر الصندوق إن لم يكن فيه شيء.
 */
export function CampaignAlerts({ alerts, metaErrors }: { alerts: CampaignAlert[]; metaErrors: string[] }) {
  if (alerts.length === 0 && metaErrors.length === 0) return null;
  const money = (n: number, c: string) => `${ar.format(n)} ${currencyLabel(c)}`;

  return (
    /* Collapsed by default (Khalid, 29 Sep 2026: «حطّها في كولابس») — the count stays in view,
       the list opens on a click. <details> needs no client code. */
    <details aria-label="تنبيهات" className="group rounded-lg border border-rose-500/40 bg-rose-500/5 px-3 py-2">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-rose-800 marker:hidden dark:text-rose-300 [&::-webkit-details-marker]:hidden">
        <AlertTriangle className="size-4" aria-hidden />
        {alerts.length > 0 ? `${ar.format(alerts.length)} تنبيه` : "ميتا غير متاحة"}
        <span className="text-xs font-normal text-rose-800/70 dark:text-rose-300/70">— اضغط للعرض</span>
        <ChevronDown className="ms-auto size-4 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <ul className="mt-2 space-y-1 border-t border-rose-500/20 pt-2 text-xs">
        {alerts.map((a, i) => (
          <li key={i} className="leading-relaxed">
            {a.kind === "unapproved" ? (
              <>
                <b>شغّالة بلا موافقة:</b> «{a.campaign.name}» — صرفت{" "}
                {money(a.campaign.spend, a.currency)} — واسمها لا يحمل كود بريفٍ موافَقٍ عليه.
              </>
            ) : a.kind === "afterEnd" ? (
              <>
                <b>شغّالة بعد الإيقاف:</b>{" "}
                <Link href={`/campaigns/${a.briefId}/edit`} className="underline">
                  <span dir="ltr" className="font-mono">{a.code}</span> {a.name}
                </Link>{" "}
                أُوقفت هنا و«{a.campaign.name}» لسه شغّالة في ميتا — صرفت {money(a.campaign.spend, a.currency)}
              </>
            ) : a.kind === "overCap" ? (
              <>
                <b>تجاوز السقف:</b>{" "}
                <Link href={`/campaigns/${a.briefId}/edit`} className="underline">
                  <span dir="ltr" className="font-mono">{a.code}</span> {a.name}
                </Link>{" "}
                — صُرف {money(a.spend, a.currency)} من سقف {money(a.cap, a.currency)}
              </>
            ) : (
              <>
                <b>تكلفة العميل فوق المستهدف:</b>{" "}
                <Link href={`/campaigns/${a.briefId}/edit`} className="underline">
                  <span dir="ltr" className="font-mono">{a.code}</span> {a.name}
                </Link>{" "}
                —{" "}
                {a.costPerLead != null
                  ? `${money(a.costPerLead, a.currency)} للعميل والمستهدف ${money(a.target, a.currency)}`
                  : `صُرف ${money(a.spend, a.currency)} ولم يجب عميلاً بعد — المستهدف ${money(a.target, a.currency)} للعميل`}
              </>
            )}
          </li>
        ))}
        {metaErrors.map((e) => (
          <li key={e} className="text-muted-foreground">{e}</li>
        ))}
      </ul>
    </details>
  );
}
