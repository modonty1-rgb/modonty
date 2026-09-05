"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check, Clock, Loader2, Mail, MapPin, MessageCircle, Phone, Send, StickyNote, Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { addFollowUp, completeFollowUp, snoozeFollowUp } from "../actions";
import { formatCount } from "../helpers/format-count";
import {
  CHANNELS, CHANNEL_LABEL, DUE_TONE, PICKABLE_STAGES, STAGE_DOT, STAGE_LABEL,
  describeDue, type Channel, type Stage,
} from "../helpers/funnel";

const CHANNEL_ICON: Record<Channel, typeof Phone> = {
  CALL: Phone,
  WHATSAPP: MessageCircle,
  EMAIL: Mail,
  MEETING: Users,
  VISIT: MapPin,
  NOTE: StickyNote,
};

const dayFmt = new Intl.DateTimeFormat("ar-EG", {
  day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh",
});
const timeFmt = new Intl.DateTimeFormat("ar-EG", {
  hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh",
});

/** `YYYY-MM-DD` محلّياً — `toISOString` تحوّل إلى UTC فيقفز اليوم في توقيت الرياض. */
function isoDay(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const WHEN_PRESETS = [
  { label: "غداً", days: 1 },
  { label: "بعد ٣ أيام", days: 3 },
  { label: "الأسبوع القادم", days: 7 },
  { label: "بعد أسبوعين", days: 14 },
] as const;

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

  const [channel, setChannel] = useState<Channel>("CALL");
  const [body, setBody] = useState("");
  const [when, setWhen] = useState("");
  const [whenNote, setWhenNote] = useState("");
  const [stageAfter, setStageAfter] = useState("");

  const submit = () =>
    start(async () => {
      const r = await addFollowUp(leadId, {
        channel,
        happenedAt: new Date(),
        body,
        nextActionAt: when || undefined,
        nextActionNote: whenNote || undefined,
        stageAfter: stageAfter || undefined,
      });
      if (!r.success) {
        toast({ title: r.error, variant: "destructive" });
        return;
      }
      setBody("");
      setWhen("");
      setWhenNote("");
      setStageAfter("");
      setChannel("CALL");
      toast({ title: "سُجِّلت", variant: "success" });
      router.refresh();
    });

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
          <CardHeader className="pb-3">
            <CardTitle className="text-base">سجّلي ما حدث</CardTitle>
            <CardDescription>كل مكالمة أو رسالة تُسجَّل هنا، وتبقى في تاريخه للأبد.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {CHANNELS.map((c) => {
                const Icon = CHANNEL_ICON[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    aria-pressed={channel === c}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                      channel === c
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {CHANNEL_LABEL[c]}
                  </button>
                );
              })}
            </div>

            <Textarea
              id="followUpBody"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="قال إنه سيراجع العرض مع شريكه ويردّ الأسبوع القادم."
              aria-label="ما حدث"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs">متى أكلّمه مرة ثانية؟</Label>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {WHEN_PRESETS.map((p) => {
                    const value = isoDay(p.days);
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setWhen(when === value ? "" : value)}
                        aria-pressed={when === value}
                        className={cn(
                          "h-9 rounded-full border px-2 text-xs font-medium transition-colors",
                          when === value
                            ? "border-amber-500 bg-amber-500 text-background"
                            : "border-border text-muted-foreground hover:border-amber-500/50 hover:text-foreground",
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <Input
                  type="date"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  dir="ltr"
                  aria-label="أو تاريخ آخر"
                  className="mt-1.5 h-9"
                />
                {/* الخانة الأصلية تكتب شكلها بلغة المتصفّح (`mm/dd/yyyy` على شاشة عربية) ولا
                    يملك المتصفّح واجهةً لتغييره — فالمقروء يُكتب تحتها بالعربي. */}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {when
                    ? new Intl.DateTimeFormat("ar-EG", { weekday: "long", day: "numeric", month: "long" })
                        .format(new Date(`${when}T09:00:00`))
                    : "بدون موعد، العميل يُنسى"}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="whenNote" className="text-xs">لماذا؟</Label>
                  <Input
                    id="whenNote"
                    value={whenNote}
                    onChange={(e) => setWhenNote(e.target.value)}
                    placeholder="سيردّ بعد ما يكلّم شريكه"
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">ينتقل إلى مرحلة أخرى؟</Label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {PICKABLE_STAGES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStageAfter(stageAfter === s ? "" : s)}
                        aria-pressed={stageAfter === s}
                        className={cn(
                          "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors",
                          stageAfter === s
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                        )}
                      >
                        <span className={cn("size-1.5 rounded-full", STAGE_DOT[s])} aria-hidden />
                        {STAGE_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={submit} disabled={pending || body.trim().length < 2} className="gap-2">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 rtl:rotate-180" />}
              {pending ? "جارٍ التسجيل…" : "سجّلي"}
            </Button>
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
              لا يوجد شيء مسجَّل بعد. أول مكالمة تكتبينها ستظهر هنا.
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

                      {r.nextActionAt && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className={cn("inline-flex items-center gap-1.5", owed ? DUE_TONE[due.tone] : "text-muted-foreground line-through")}>
                            <Clock className="size-3.5" aria-hidden />
                            {due.text}
                            {r.nextActionNote ? ` — ${r.nextActionNote}` : ""}
                          </span>
                          {owed && !closed && (
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
                                أجّليه ٣ أيام
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
