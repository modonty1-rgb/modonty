"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { addFollowUp } from "../actions";
import { CHANNEL_ICON } from "../helpers/channel-icon";
import { isNoAnswer } from "../helpers/no-answer";
import { CHANNELS, CHANNEL_LABEL, type Channel } from "../helpers/funnel";

/**
 * تسجيل ما حدث — النموذج نفسه في صفحة العميل وتحت «+» في جدول العملاء المحتملين (خالد ٢٨
 * سبتمبر ٢٠٢٦: المرحلة الثالثة «تسجيل المتابعة من السطر»)، فلا تُفتح صفحة لتسجيل مكالمة.
 *
 * أقلّ ما يكفي: القناة · ما حدث · الموعد القادم إن وُجد · تسجيل. والمرحلة تتحرّك وحدها على
 * السيرفر (أوّل تواصل ← «تواصلنا»). `compact` للجدول: أزرار أصغر وخانة أقصر.
 */
export function LogForm({
  leadId,
  compact = false,
  onLogged,
}: {
  leadId: string;
  compact?: boolean;
  /** بعد نجاح التسجيل — الجدول يُبقي الصفّ ظاهراً به ولو خرج من المرشّح. */
  onLogged?: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [channel, setChannel] = useState<Channel>("CALL");
  const [body, setBody] = useState("");
  const [when, setWhen] = useState("");
  // Two forms can be on one screen (a row open in the table): ids must not collide.
  const uid = useId();

  const submit = () =>
    start(async () => {
      const r = await addFollowUp(leadId, { channel, happenedAt: new Date(), body, nextActionAt: when || undefined });
      if (!r.success) {
        toast({ title: r.error, variant: "destructive" });
        return;
      }
      const hadDate = Boolean(when);
      setBody("");
      setWhen("");
      setChannel("CALL");
      onLogged?.();
      toast({
        title: isNoAnswer(body) ? "سُجِّلت محاولة — ما ردّ" : hadDate ? "سُجِّلت" : "سُجِّلت — بدون موعد قادم",
        variant: "success",
      });
      router.refresh();
    });

  const pills = (
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
              "inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors",
              compact ? "h-7 px-2.5 text-[11px]" : "h-9 px-3 text-xs",
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
  );
  const note = (
    <Textarea
      id={`${uid}-body`}
      value={body}
      onChange={(e) => setBody(e.target.value)}
      rows={compact ? 2 : 3}
      placeholder="ما حدث — مثلاً: يبي يشاور شريكه ويردّ الأسبوع الجاي."
      aria-label="ما حدث"
      className="bg-card"
    />
  );
  const dateInput = (
    <div className={cn(compact && "flex items-center gap-2")}>
      <Label htmlFor={`${uid}-next`} className="whitespace-nowrap text-xs">
        الموعد القادم <span className="font-normal text-muted-foreground">— اختياري</span>
      </Label>
      <Input
        id={`${uid}-next`}
        type="date"
        value={when}
        onChange={(e) => setWhen(e.target.value)}
        dir="ltr"
        className={cn("w-44 bg-card", compact ? "h-8" : "mt-1 h-9")}
      />
    </div>
  );
  const submitButton = (
    <Button type="button" onClick={submit} disabled={pending || body.trim().length < 2} className={cn("gap-2", compact ? "h-8" : "h-9")}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 rtl:rotate-180" />}
      {pending ? "جارٍ التسجيل…" : "تسجيل"}
    </Button>
  );

  /**
   * In the table (`compact`) the date and «تسجيل» sit beside the channel pills (Khalid, 28 Sep
   * 2026: «الموعد القادم وكلمة التسجيل طلعهم فوق جنب التوجل»): two lines, not three. On the
   * lead's page the full-width card keeps the reading order pills · text · date.
   */
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {pills}
          <div className="ms-auto flex items-center gap-2">
            {dateInput}
            {submitButton}
          </div>
        </div>
        {note}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pills}
      {note}
      <div className="flex flex-wrap items-end gap-3">
        {dateInput}
        <div className="ms-auto">{submitButton}</div>
      </div>
    </div>
  );
}
