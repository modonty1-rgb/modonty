import Link from "next/link";
import { Pencil, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AD_CHANNEL_LABEL } from "@/lib/ad-channel-label";
import {
  OBJECTIVE_LABEL, STATUS_DOT, STATUS_LABEL, STATUS_TONE,
  campaignDays, marketOf, totalBudget,
} from "../helpers/channels";
import type { CampaignRow } from "../helpers/get-campaigns";

const ar = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });
const day = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" });

/**
 * فاصلٌ بين حقائق السطر — و`/70` لا `/40`.
 *
 * مقيس على الوضع الداكن: `/40` تعطي `2.11:1`، وفاصلٌ بهذه الخفوت لا يفصل شيئاً بصرياً أصلاً
 * فيلتصق «سناب شات» بـ«مصر». وهو `aria-hidden` فلا تسري عليه العتبة، لكن العتبة هنا تكشف
 * عيباً حقيقياً في القراءة لا مخالفةً شكلية.
 */
function Dot() {
  return <span className="text-muted-foreground/70" aria-hidden>·</span>;
}

/**
 * الحملة بطاقةً — بنفس شكل بطاقة العميل المحتمل، وللسبب نفسه.
 *
 * الأرقام المعروضة كلّها **مشتقّة** من `dailyBudget` والتاريخين: لا إجماليَّ مخزَّناً يكذب بعد
 * تمديد.
 */
export function CampaignCard({ row }: { row: CampaignRow }) {
  const market = marketOf(row.countryCode);
  const days = campaignDays(row.startAt, row.endAt);
  const total = totalBudget(row.dailyBudget, row.startAt, row.endAt);

  const perLead = row._count.leads > 0 ? total / row._count.leads : null;

  return (
    <article className="rounded-lg border bg-card transition-colors hover:border-foreground/20">
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/campaigns/${row.id}/edit`} className="block truncate font-medium leading-tight hover:underline">
              {row.name}
            </Link>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground">
              <span>{AD_CHANNEL_LABEL[row.channel]}</span>
              <Dot />
              <span>{market.label}</span>
              <Dot />
              <span>{OBJECTIVE_LABEL[row.objective]}</span>
              <Dot />
              <span dir="rtl">{day.format(row.startAt)} — {day.format(row.endAt)}</span>
            </p>
          </div>
          <span className={cn("shrink-0 whitespace-nowrap text-xs font-medium", STATUS_TONE[row.status])}>
            <span className={cn("me-1.5 inline-block size-1.5 rounded-full align-middle", STATUS_DOT[row.status])} aria-hidden />
            {STATUS_LABEL[row.status]}
          </span>
        </div>

        {/* الاستهداف على البطاقة — سببُ وجود الحقول أصلاً: تُعرف الحملة «على مَن كانت» بلا
            فتحها. ولا يظهر السطر إن لم يُكتب شيء، فلا يبقى صفٌّ فارغ يشغل مكاناً. */}
        {(row.targetRegion || row.targetAge || row.targetAudience) && (
          <p className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground">
            <span className="text-muted-foreground">الاستهداف:</span>
            {[row.targetRegion, row.targetAge, row.targetAudience]
              .filter(Boolean)
              .map((v, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  {i > 0 && <Dot />}
                  <span className="truncate">{v}</span>
                </span>
              ))}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 rounded border bg-muted/30 px-2 py-1.5 text-center">
          <Figure label="في اليوم" value={ar.format(row.dailyBudget)} />
          <Figure label={`إجمالي ${ar.format(days)} يوم`} value={ar.format(total)} />
          <Figure
            label="تكلفة العميل"
            value={perLead === null ? "—" : ar.format(perLead)}
            muted={perLead === null}
          />
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-1.5 border-t bg-muted/30 px-3 py-2">
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Users className="size-3" aria-hidden />
          {row._count.leads > 0 ? `${ar.format(row._count.leads)} عميل محتمل` : "لسه ما جاب حد"}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground" dir="ltr">{row.utmCampaign}</span>
        <Button asChild variant="ghost" size="sm" className="ms-auto h-7 gap-1 px-2 text-[11px]">
          <Link href={`/campaigns/${row.id}/edit`}>
            <Pencil className="size-3" aria-hidden /> تعديل
          </Link>
        </Button>
      </footer>
    </article>
  );
}

function Figure({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="min-w-0">
      <div className={cn("text-[13px] font-semibold tabular-nums", muted && "text-muted-foreground")}>{value}</div>
      <div className="truncate text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
