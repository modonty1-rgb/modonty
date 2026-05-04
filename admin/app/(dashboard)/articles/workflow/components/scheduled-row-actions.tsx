"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, CalendarCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { transitionArticleAction } from "../actions/transition-article";
import { setScheduledDateAction } from "../actions/set-scheduled-date";

interface Props {
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

export function ScheduledRowActions({ articleId, articleTitle, scheduledAt }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Track which specific button is loading so the spinner only shows on the right one.
  const [activeAction, setActiveAction] = useState<"publish" | "schedule" | null>(null);

  // Default value: existing scheduledAt OR right now (today + current time).
  const initialDate = scheduledAt ? new Date(scheduledAt) : new Date();
  const [datetimeValue, setDatetimeValue] = useState(toLocalDatetimeInput(initialDate));

  const handlePublishNow = () => {
    if (
      !confirm(
        `نشر "${articleTitle}" الآن؟ سيظهر للقرّاء فوراً.`,
      )
    )
      return;
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
    const isoDate = new Date(datetimeValue).toISOString();
    setActiveAction("schedule");
    startTransition(async () => {
      const res = await setScheduledDateAction(articleId, isoDate);
      if (res.success) {
        toast({
          title: "تم حفظ الموعد",
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
      <Button
        type="button"
        size="sm"
        onClick={handlePublishNow}
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
        Save Schedule
      </Button>
    </div>
  );
}
