"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check, Clock, Loader2, StickyNote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { completeFollowUp, snoozeFollowUp } from "../actions";
import { CHANNEL_ICON } from "../helpers/channel-icon";
import { LogForm } from "./log-form";
import { NoAnswerButton } from "./no-answer-button";
import { formatCount } from "../helpers/format-count";
import {
  CHANNEL_LABEL, DUE_TONE, STAGE_DOT, STAGE_LABEL,
  describeDue, type Channel, type Stage,
} from "../helpers/funnel";


const dayFmt = new Intl.DateTimeFormat("ar-EG", {
  day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh",
});
const timeFmt = new Intl.DateTimeFormat("ar-EG", {
  hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh",
});

export interface FollowUpRow {
  id: string;
  channel: string;
  happenedAt: Date;
  body: string;
  nextActionAt: Date | null;
  nextActionNote: string | null;
  doneAt: Date | null;
  stageAfter: string | null;
  createdBy: { name: string | null } | null;
}

interface Props {
  leadId: string;
  rows: FollowUpRow[];
  /** العدد الحقيقي في القاعدة — فوق طول `rows` يعني أن السقف بتر شيئاً، وتقوله الشاشة. */
  total: number;
  /** مقفول (قفلنا أو خسرناه)؟ عندها يُقرأ السجلّ ولا يُكتب فيه. */
  closed?: boolean;
}

/**
 * سجلّ العميل — قصة حياته كاملة، وهو ما طلبه خالد (٤ سبتمبر).
 *
 * النموذج مفتوحٌ دائماً في أعلى السجلّ لا خلف زرّ: المندوبة تفتح الصفحة كي **تسجّل**، وإخفاء
 * الفعل الأكثر تكراراً خلف ضغطة يضيف ضغطةً إلى كل مكالمة في اليوم. والسجلّ تحته يُقرأ من
 * الأحدث إلى الأقدم، لأن السؤال دائماً «آخر مرّة حصل إيه؟» لا «إزاي بدأنا؟».
 */
export function FollowUpLog({ leadId, rows, total, closed = false }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [busyRow, setBusyRow] = useState<string | null>(null);

  const rowAction = (id: string, fn: () => Promise<{ success: boolean; error?: string }>, okText: string) =>
    start(async () => {
      setBusyRow(id);
      const r = await fn();
      setBusyRow(null);
      if (r.success) {
        toast({ title: okText, variant: "success" });
        router.refresh();
      } else {
        toast({ title: r.error ?? "ما نجح.", variant: "destructive" });
      }
    });

  return (
    <div className="space-y-4">
      {!closed && (
        <Card>
          {/**
           * أقلّ ما يكفي (خالد ٢٨ سبتمبر ٢٠٢٦: «في حشو كتير… يكلموا بكرة أو بعد ثلاثة أيام، هذا
           * العميل يحددها»): القناة · ما حدث · الموعد القادم إن وُجد · تسجيل. والمرحلة تتحرّك وحدها على السيرفر.
           * أُزيلت أزرار «غداً · بعد ٣ أيام…» وخانة «لماذا؟» — السبب يُكتب في «ما حدث» نفسه.
           * وبصيغةٍ محايدة لا مؤنّثة: الشاشة لكل الفريق.
           */}
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">تسجيل ما حدث</CardTitle>
            <NoAnswerButton leadId={leadId} />
          </CardHeader>
          <CardContent>
            <LogForm leadId={leadId} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            التاريخ
            {total > 0 && (
              <span className="ms-2 text-xs font-normal tabular-nums text-muted-foreground">
                {formatCount(total)}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              لا يوجد شيء مسجَّل بعد. أول مكالمة تُسجَّل تظهر هنا.
            </p>
          ) : (
            <ol className="relative space-y-0">
              {rows.map((r, i) => {
                const Icon = CHANNEL_ICON[(r.channel as Channel) ?? "NOTE"] ?? StickyNote;
                const owed = r.nextActionAt && !r.doneAt;
                const due = describeDue(r.nextActionAt);
                return (
                  <li key={r.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {/* الخيط بين النقاط — يوقف عند آخر صفّ فلا يتدلّى في الفراغ. */}
                    {i < rows.length - 1 && (
                      <span className="absolute top-8 h-[calc(100%-1.5rem)] w-px bg-border start-[15px]" aria-hidden />
                    )}
                    <span className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
                      <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground">{CHANNEL_LABEL[r.channel as Channel] ?? "ملاحظة"}</span>
                        <span>{dayFmt.format(r.happenedAt)} · {timeFmt.format(r.happenedAt)}</span>
                        {r.createdBy?.name && <span>— {r.createdBy.name}</span>}
                        {r.stageAfter && (
                          <span className="inline-flex items-center gap-1">
                            <span className={cn("size-1.5 rounded-full", STAGE_DOT[r.stageAfter as Stage])} aria-hidden />
                            انتقل إلى «{STAGE_LABEL[r.stageAfter as Stage]}»
                          </span>
                        )}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{r.body}</p>

                      {/* Only an open appointment is shown. A closed one read «متأخّر ٣٣ يوم»
                          struck through — a finished step that looked like a missed one. */}
                      {owed && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className={cn("inline-flex items-center gap-1.5", DUE_TONE[due.tone])}>
                            <Clock className="size-3.5" aria-hidden />
                            {due.text}
                            {r.nextActionNote ? ` — ${r.nextActionNote}` : ""}
                          </span>
                          {!closed && (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 gap-1 px-2 text-xs"
                                disabled={pending}
                                onClick={() => rowAction(r.id, () => completeFollowUp(r.id), "أُغلق")}
                              >
                                {busyRow === r.id && pending ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <Check className="size-3" aria-hidden />
                                )}
                                تمّ
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                                disabled={pending}
                                onClick={() => rowAction(r.id, () => snoozeFollowUp(r.id, 3), "تأجيل ٣ أيام")}
                              >
                                تأجيل ٣ أيام
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {/* السقف يُقال حين يُبلَغ. البتر الصامت يُقرأ كـ«ده كل التاريخ» وهو ليس كذلك. */}
          {total > rows.length && (
            <p className="mt-4 border-t pt-3 text-[11px] text-muted-foreground">
              معروض أحدث <span className="tabular-nums">{formatCount(rows.length)}</span> من{" "}
              <span className="tabular-nums">{formatCount(total)}</span> — الباقي في القاعدة ولم يُحذف.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
