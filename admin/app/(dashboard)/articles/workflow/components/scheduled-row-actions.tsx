"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, CalendarCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { transitionArticleAction } from "../actions/transition-article";
import { setScheduledDateAction } from "../actions/set-scheduled-date";

interface Props {
  /**
   * `approved` — the client said yes and there is no date yet: the only action is to pick
   * one («Schedule»). `scheduled` — dated already: move the date, or publish now.
   */
  mode?: "approved" | "scheduled";
  /** Where this one lands — the copy must not promise modonty for a client's article. */
  clientSiteUrl?: string | null;
  articleId: string;
  articleTitle: string;
  scheduledAt: Date | null;
}

/**
 * Format a Date for the <input type="datetime-local"> value attribute.
 * Datetime-local expects "YYYY-MM-DDTHH:MM" in the user's local timezone.
 */
function toLocalDatetimeInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Tomorrow 09:00 in the browser's time — a sane first pick, never «now» (27 Sep 2026). */
function tomorrowNine(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
}

export function ScheduledRowActions({ articleId, articleTitle, scheduledAt, clientSiteUrl, mode = "scheduled" }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Track which specific button is loading so the spinner only shows on the right one.
  const [activeAction, setActiveAction] = useState<"publish" | "schedule" | null>(null);

  // Default: the saved date, else tomorrow 09:00. It was «right now» — one click on Save
  // without touching the field scheduled a past time, i.e. publish on the next cron tick.
  const initialDate = scheduledAt ? new Date(scheduledAt) : tomorrowNine();
  const [datetimeValue, setDatetimeValue] = useState(toLocalDatetimeInput(initialDate));

  const handlePublishNow = () => {
    setActiveAction("publish");
    startTransition(async () => {
      const res = await transitionArticleAction(articleId, "SCHEDULED", "PUBLISHED");
      if (res.success) {
        toast({ title: "تم النشر", description: "المقال أصبح منشوراً." });
        router.refresh();
      } else {
        toast({
          title: "فشل النشر",
          description: res.error ?? "حدث خطأ غير معروف",
          variant: "destructive",
        });
      }
      setActiveAction(null);
    });
  };

  const handleSaveSchedule = () => {
    if (!datetimeValue) {
      toast({ title: "اختر تاريخاً ووقتاً أولاً", variant: "destructive" });
      return;
    }
    // Convert local datetime input to ISO; new Date() reads it as local time.
    const picked = new Date(datetimeValue);
    if (picked.getTime() <= Date.now()) {
      toast({ title: "اختر وقتاً في المستقبل", description: "للنشر الآن استخدم «Publish Now».", variant: "destructive" });
      return;
    }
    const isoDate = picked.toISOString();
    setActiveAction("schedule");
    startTransition(async () => {
      const res = await setScheduledDateAction(articleId, isoDate);
      if (res.success) {
        toast({
          title: mode === "approved" ? "تمت الجدولة" : "تم حفظ الموعد",
          description: "العميل سيرى الموعد الجديد في console.",
        });
        router.refresh();
      } else {
        toast({
          title: "فشل حفظ الموعد",
          description: res.error ?? "حدث خطأ غير معروف",
          variant: "destructive",
        });
      }
      setActiveAction(null);
    });
  };

  return (
    <div className="flex items-end gap-2 flex-wrap">
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`schedule-${articleId}`}
          className="text-[10px] text-muted-foreground uppercase tracking-wide"
        >
          تاريخ النشر
        </label>
        <input
          id={`schedule-${articleId}`}
          type="datetime-local"
          value={datetimeValue}
          onChange={(e) => setDatetimeValue(e.target.value)}
          disabled={isPending}
          className="rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>
      {/* Approved lane: no «Publish Now» — the team's step there is to give it a date. */}
      {mode === "scheduled" ? (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {activeAction === "publish" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Publish Now
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>نشر المقال الآن؟</AlertDialogTitle>
            <AlertDialogDescription>
              {clientSiteUrl ? (
                <>
                  سيُسلَّم المقال <strong>&quot;{articleTitle}&quot;</strong> لموقع العميل، ويظهر
                  عندهم على{" "}
                  <code dir="ltr" className="font-mono text-xs">
                    {clientSiteUrl}
                  </code>{" "}
                  خلال ساعة من سحبه. ولا يظهر على modonty.com إطلاقاً.
                </>
              ) : (
                <>
                  سيظهر المقال <strong>&quot;{articleTitle}&quot;</strong> للقرّاء على modonty.com فوراً.
                </>
              )}{" "}
              لا يمكن التراجع تلقائياً بعد النشر.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublishNow}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              نعم، انشر الآن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleSaveSchedule}
        disabled={isPending}
      >
        {activeAction === "schedule" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CalendarCheck className="h-4 w-4" />
        )}
        {mode === "approved" ? "Schedule" : "Save Schedule"}
      </Button>
    </div>
  );
}
