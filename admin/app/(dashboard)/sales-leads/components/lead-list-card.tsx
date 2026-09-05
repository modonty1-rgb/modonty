"use client";

import Link from "next/link";
import { MessageCircle, Pencil, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SILENCE_TONE, describeSilence } from "../helpers/describe-silence";
import {
  DUE_TONE, LOST_LABEL, STAGE_DOT, STAGE_LABEL, STAGE_TEXT,
  describeDue, formatMoney, waNumber, type LostReason, type Stage,
} from "../helpers/funnel";
import { MARKET_EDGE, MARKET_LABEL } from "../helpers/markets";
import type { SalesLeadRow } from "../helpers/get-sales-leads";

/** فاصلٌ بين حقائق السطر الواحد — نقطةٌ لا شرطة، فالشرطة تُقرأ ناقصاً في سياق الأرقام. */
function Dot() {
  return <span className="text-muted-foreground/40" aria-hidden>·</span>;
}

/**
 * العميل بطاقةً لا صفّاً (خالد ٥ سبتمبر) — والأكشنز في تذييلها.
 *
 * الصفّ يجبر كل حقيقةٍ على عمودٍ ثابت العرض، فتُقصّ الملاحظة الطويلة ويُهدَر عرض «طبيعي».
 * والبطاقة تعطي كلّاً قدره: الاسم سطراً كاملاً، والحقائق القصيرة في سطرٍ واحد، والفعل في
 * تذييلٍ لا يزاحم القراءة.
 *
 * والأهمّ: الفعل صار **على البطاقة** لا خلف فتح صفحة. كانت المندوبة تفتح العميل لتتّصل به،
 * والآن الاتّصال والواتساب والتعديل ثلاث ضغطاتٍ من القائمة نفسها.
 */
export function LeadListCard({
  lead,
  /** سُجِّل للتوّ — حلقةٌ تقول «هذا هو» بلا أن تُزيح البطاقة عن شكلها. */
  highlight = false,
}: {
  lead: SalesLeadRow;
  highlight?: boolean;
}) {
  const silence = describeSilence(lead.lastTouchAt);
  const due = describeDue(lead.nextActionAt);
  const stage = lead.stage as Stage;
  const wa = waNumber(lead.phone, lead.countryCode);
  const money = formatMoney(lead.dealTotal, lead.currency);

  return (
    <article
      className={cn(
        "group rounded-lg border bg-card transition-colors hover:border-foreground/20",
        // الحافّة البادئة بلون السوق — تُفرز القائمة بنظرة، وتبقى محايدةً لمن بلا سوق.
        "border-s-[3px]",
        MARKET_EDGE[lead.countryCode ?? ""] ?? "border-s-border",
        highlight && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <div className="space-y-2 p-3">
        {/* الاسم والصمت طرفَي السطر: مَن هو، وكم له ساكتاً — أوّل سؤالين في المراجعة. */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/sales-leads/${lead.id}`}
              className="block truncate font-medium leading-tight hover:underline"
            >
              {lead.name}
            </Link>
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
              {lead.lastNote || lead.company || "لم يُسجَّل شيء بعد"}
            </p>
          </div>
          <span
            className={cn("shrink-0 whitespace-nowrap text-xs font-medium tabular-nums", SILENCE_TONE[silence.tone])}
            title="منذ آخر تواصل"
          >
            {silence.text}
          </span>
        </div>

        {/* سطر الحقائق — ما كان أعمدةً بعرضٍ محجوز، صار كلمات بقدرها. */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px]">
          <span className="inline-flex items-center gap-1">
            <span className={cn("size-1.5 rounded-full", STAGE_DOT[stage])} aria-hidden />
            <span className={cn("font-medium", STAGE_TEXT[stage])}>{STAGE_LABEL[stage] ?? stage}</span>
          </span>

          {stage === "LOST" && lead.lostReason && (
            <>
              <Dot />
              <span className="text-muted-foreground">
                {LOST_LABEL[lead.lostReason as LostReason] ?? lead.lostReason}
              </span>
            </>
          )}

          <Dot />
          <span className={cn("font-medium", DUE_TONE[due.tone])}>{due.text}</span>
          {lead.nextActionNote && (
            <span className="truncate text-muted-foreground">— {lead.nextActionNote}</span>
          )}

          <Dot />
          {lead.isPaidAd ? (
            <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-medium text-amber-800 dark:text-amber-400">
              مدفوع{lead.campaign ? ` · ${lead.campaign}` : ""}
            </span>
          ) : (
            <span className="text-muted-foreground">طبيعي</span>
          )}

          {lead.countryCode && (
            <>
              <Dot />
              {/* بلا نقطة هنا: الحافّة الملوّنة تقولها أصلاً، ورمزان لمعنًى واحد حشو. */}
              <span className="text-muted-foreground">
                {MARKET_LABEL[lead.countryCode] ?? lead.countryCode}
              </span>
            </>
          )}

          {money && (
            <>
              <Dot />
              <span className="font-medium tabular-nums">{money}</span>
            </>
          )}
        </div>
      </div>

      {/**
       * التذييل — الأفعال وحدها، مفصولةً بخطٍّ وخلفيّةٍ خافتة.
       *
       * الفصل ليس زينة: العين تمسح البطاقات بحثاً عن اسم، فإن اختلط الزرّ بالنصّ وقفت عند كل
       * زرّ. وبخلفيّةٍ مستقلّة يصير التذييل شريطاً واحداً يُقفز فوقه حتى يُحتاج.
       */}
      <footer className="flex flex-wrap items-center gap-1.5 border-t bg-muted/30 px-3 py-2">
        {lead.phone ? (
          <>
            <Button asChild variant="outline" size="sm" className="h-7 gap-1 px-2 text-[11px]">
              <a href={`tel:${lead.phone}`} aria-label={`اتّصل بـ${lead.name}`}>
                <Phone className="size-3" aria-hidden /> اتّصل
              </a>
            </Button>
            {wa && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-7 gap-1 px-2 text-[11px] text-emerald-700 dark:text-emerald-400"
              >
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`واتساب ${lead.name}`}
                >
                  <MessageCircle className="size-3" aria-hidden /> واتساب
                </a>
              </Button>
            )}
          </>
        ) : (
          <span className="text-[11px] text-muted-foreground">بدون رقم</span>
        )}

        {/* التعديل آخر اليمين… أي آخر الصفّ في العربية: فعلٌ أقلّ تكراراً من الاتّصال. */}
        <Button asChild variant="ghost" size="sm" className="ms-auto h-7 gap-1 px-2 text-[11px]">
          <Link href={`/sales-leads/${lead.id}/edit`}>
            <Pencil className="size-3" aria-hidden /> تعديل
          </Link>
        </Button>
      </footer>
    </article>
  );
}
