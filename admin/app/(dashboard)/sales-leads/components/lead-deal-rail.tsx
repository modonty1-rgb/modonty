import Link from "next/link";
import { ArrowLeftRight, CalendarClock, Pencil, Wallet } from "lucide-react";

import { ConvertDialog } from "./convert-dialog";
import { LostDialog, ReopenButton } from "./lost-dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DUE_TONE, LOST_LABEL, STAGE_DOT, describeDue, formatMoney, type Stage,
} from "../helpers/funnel";
import { formatCount } from "../helpers/format-count";
import type { LeadDetail } from "../helpers/get-lead";

/**
 * العمود الثابت يساراً — **الحالة والقرار**.
 *
 * ثلاثةٌ بترتيب إلحاحها: متى أرجع له · بكم وأي باقة · وماذا أفعل به الآن. وكلّها كانت مبعثرة:
 * الموعد صفٌّ ثالث في بطاقة عرضها الصفحة كلّها، والأزرار في الرأس فوق. صارت في عمودٍ يثبت
 * مع التمرير، فالقرار في متناول اليد وأنت تقرأ السجلّ لا بعد الرجوع إلى الأعلى.
 */
export function LeadDealRail({
  lead,
  suggestedSlug,
  tierLabels,
  dealTotal,
  dealMonths,
}: {
  lead: LeadDetail;
  suggestedSlug: string;
  /** أسماء الباقات من `modonty_plans` — لا خريطةٌ مكتوبة في الكود. */
  tierLabels: Record<string, string>;
  /** إجماليّ الصفقة للمدّة كلّها، ومدّتها — محسوبان على السيرفر بنفس دالّة شاشة التأسيس. */
  dealTotal: number | null;
  dealMonths: number | null;
}) {
  const stage = lead.stage as Stage;
  const closed = stage === "WON" || stage === "LOST";
  const due = describeDue(lead.nextActionAt);
  const money = formatMoney(dealTotal, lead.currency);

  return (
    <div className="space-y-3">
      {/* الموعد أوّلاً — هو السؤال الوحيد الذي يتحرّك كل يوم، والباقي ثابت.
          ويختفي كلّه على المقفول: نموذج المتابعة نفسه مخفيّ هناك، فبطاقةٌ تقول «سجّلي متابعة»
          تأمر بفعلٍ لا باب له في الشاشة. */}
      {!closed && (
      <Card
        className={cn(
          "overflow-hidden",
          due.tone === "overdue" && "border-rose-500/40 bg-rose-500/5",
          due.tone === "today" && "border-amber-500/40 bg-amber-500/5",
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
            <CalendarClock className="size-3" aria-hidden />
            الموعد القادم
          </div>
          <p className={cn("mt-1 text-sm font-semibold", DUE_TONE[due.tone])}>{due.text}</p>
          {lead.nextActionNote ? (
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {lead.nextActionNote}
            </p>
          ) : (
            !lead.nextActionAt && (
              // لا رابط هنا: الموعد يُكتب مع سبب في نموذج المتابعة بالوسط، وبابٌ ثانٍ يكتبه
              // بلا سببه يعيد الثقب الذي أُغلق حين حُذف شريط المراحل.
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                سجّلي متابعة كي لا يضيع
              </p>
            )
          )}
        </CardContent>
      </Card>
      )}

      <Card className="overflow-hidden">
        <CardContent className="space-y-2.5 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
            <Wallet className="size-3" aria-hidden />
            الصفقة
          </div>

          <div>
            <div className="text-[11px] text-muted-foreground">الباقة التي يهتمّ بها</div>
            <div className="mt-0.5 text-[13px]">
              {lead.expectedTier ? (
                tierLabels[lead.expectedTier] ?? lead.expectedTier
              ) : (
                <span className="text-muted-foreground">غير معروف بعد</span>
              )}
            </div>
          </div>

          <div>
            {/* إجماليّ المدّة لا سعر الشهر: هو الرقم الذي قيل للعميل في المكالمة. */}
            <div className="text-[11px] text-muted-foreground">
              {/**
               * المدّة تُذكر مع مبلغٍ فقط.
               *
               * نموذج التأسيس يختار مدّةً افتراضية، فعميلٌ سُجِّل بلا صفقة يُحفظ ومعه
               * `expectedMonths: 6`. فكان الرفّ يقول «الإجمالي — ٦ شهور» ثم «غير محدّد» تحته:
               * مدّةُ صفقةٍ لا وجود لها. مقيس على عميلٍ أنشأته للتوّ بلا باقة ولا مبلغ.
               */}
              {money && dealMonths ? `الإجمالي — ${formatCount(dealMonths)} شهور` : "قيمة الصفقة"}
            </div>
            <div className="mt-0.5 text-lg font-semibold tabular-nums leading-none">
              {money ?? <span className="text-sm font-normal text-muted-foreground">غير محدّد</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* القرار — والحالة المقفولة تحلّ محلّه: لا يُعرض زرٌّ لا يصحّ ضغطه. */}
      {stage === "WON" || stage === "LOST" ? (
        <Card className="overflow-hidden">
          <CardContent className="space-y-2 p-3 text-[13px]">
            <p className="flex items-start gap-2 leading-snug">
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", STAGE_DOT[stage])} aria-hidden />
              {stage === "WON" ? "أُغلق وصار عميلاً عندنا." : "أُغلق كخسارة."}
            </p>
            {/* السبب هو كل الفائدة من تسجيل الخسارة — فيُعرض حيث تُعرض الخسارة. */}
            {stage === "LOST" && lead.lostReason && (
              <p className="text-[11px] text-muted-foreground">
                السبب:{" "}
                <span className="font-medium text-foreground">
                  {LOST_LABEL[lead.lostReason as keyof typeof LOST_LABEL] ?? lead.lostReason}
                </span>
                {lead.lostNote ? ` — «${lead.lostNote}»` : ""}
              </p>
            )}
            {lead.convertedClientId ? (
              <Button asChild variant="secondary" size="sm" className="w-full gap-1.5">
                <Link href={`/clients/${lead.convertedClientId}`}>
                  <ArrowLeftRight className="size-3.5 rtl:rotate-180" aria-hidden />
                  افتح صفحته كعميل
                </Link>
              </Button>
            ) : (
              stage === "LOST" && <ReopenButton leadId={lead.id} className="w-full" />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <ConvertDialog
            leadId={lead.id}
            leadName={lead.name}
            suggestedSlug={suggestedSlug}
            email={lead.email}
            expectedTier={lead.expectedTier}
            tierLabels={tierLabels}
            className="w-full"
          />
          <div className="flex gap-2">
            {/* `asChild`: زرٌّ داخل رابط تعشيقٌ ممنوع في المواصفة — والوجهة رابط فالعنصر رابط. */}
            <Button asChild variant="outline" size="sm" className="flex-1 gap-1.5">
              <Link href={`/sales-leads/${lead.id}/edit`}>
                <Pencil className="size-3.5" aria-hidden /> تعديل
              </Link>
            </Button>
            <LostDialog leadId={lead.id} leadName={lead.name} className="flex-1" />
          </div>
        </div>
      )}
    </div>
  );
}
