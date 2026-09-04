"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { completeFollowUp, snoozeFollowUp } from "../actions";
import { CHANNEL_LABEL, DUE_TONE, STAGE_DOT, STAGE_LABEL, describeDue, waNumber, type Channel, type Stage } from "../helpers/funnel";
import type { DueRow } from "../helpers/get-due-follow-ups";

const dayFmt = new Intl.DateTimeFormat("ar-EG", {
  day: "numeric", month: "long", timeZone: "Asia/Riyadh",
});

/**
 * صفٌّ واحد في قائمة المتابعة.
 *
 * يعرض ما يكفي للاتّصال بلا فتح صفحة العميل: اسمه، وما قيل آخر مرّة، ولماذا اتُّفق على هذا
 * الموعد. البديل — سطرٌ باسمٍ وتاريخ — يجبر المندوبة على فتح صفحةٍ لكل صفّ لتتذكّر السياق،
 * أي عشرين فتحةً في الصباح الواحد.
 */
function Row({ row, onDone, onSnooze, busy }: {
  row: DueRow;
  onDone: () => void;
  onSnooze: () => void;
  busy: boolean;
}) {
  const due = describeDue(row.nextActionAt);
  // الرقم الدولي الكامل مبنيّاً من الدولة — `wa.me` لا يفتح رقماً محلّياً بصفره البادئ.
  const waDigits = waNumber(row.phone, row.countryCode);

  return (
    <li className="flex flex-col gap-2 border-b py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href={`/sales-leads/${row.leadId}`} className="font-medium hover:underline">
            {row.leadName}
          </Link>
          {row.company && <span className="text-xs text-muted-foreground">{row.company}</span>}
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className={cn("size-1.5 rounded-full", STAGE_DOT[row.stage])} aria-hidden />
            {STAGE_LABEL[row.stage]}
          </span>
          <span className={cn("text-xs font-medium", DUE_TONE[due.tone])}>
            {due.text} · {dayFmt.format(row.nextActionAt)}
          </span>
        </div>

        {row.nextActionNote && (
          <p className="mt-0.5 text-xs text-muted-foreground">علشان: {row.nextActionNote}</p>
        )}
        {/* آخر ما قيل — سطر واحد. هو الفرق بين «اتصلي بفلان» و«اتصلي بفلان اللي قال إنه
            هيراجع العرض مع شريكه». */}
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/90">
          <span className="text-muted-foreground">{CHANNEL_LABEL[row.channel as Channel] ?? "ملاحظة"}:</span>{" "}
          {row.body}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        {row.phone && (
          <>
            <a href={`tel:${row.phone}`} aria-label={`اتصلي بـ${row.leadName}`}>
              <Button type="button" variant="outline" size="sm" className="h-8 gap-1 px-2 text-xs">
                <Phone className="size-3.5" aria-hidden /> اتّصلي
              </Button>
            </a>
            {waDigits && (
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`واتساب ${row.leadName}`}
              >
                <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <MessageCircle className="size-3.5" aria-hidden />
                </Button>
              </a>
            )}
          </>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1 px-2 text-xs"
          disabled={busy}
          onClick={onDone}
        >
          {busy ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" aria-hidden />}
          تمّ
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          disabled={busy}
          onClick={onSnooze}
        >
          أجّلي ٣ أيام
        </Button>
      </div>
    </li>
  );
}

interface Props {
  overdue: DueRow[];
  today: DueRow[];
  upcoming: DueRow[];
}

/**
 * قائمة المتابعة — ثلاث مجموعات بترتيب الإلحاح لا بترتيب التاريخ.
 *
 * «المتأخر» أوّلاً لأنه الوحيد الذي فيه ضررٌ واقع؛ و«النهارده» بعده لأنه شغل اليوم؛ و«الجاي»
 * أخيراً بوصفه علماً لا مطالبة. جدولٌ واحد مرتَّبٌ بالتاريخ يخلط الثلاثة فيقرأ المتأخر
 * كأنه سطرٌ عاديّ في القائمة.
 */
export function DueList({ overdue, today, upcoming }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  const act = (fn: () => Promise<{ success: boolean; error?: string }>, okText: string) =>
    start(async () => {
      const r = await fn();
      if (r.success) {
        toast({ title: okText, variant: "success" });
        router.refresh();
      } else {
        toast({ title: r.error ?? "ما نفعش.", variant: "destructive" });
      }
    });

  const group = (title: string, rows: DueRow[], tone?: string) =>
    rows.length > 0 && (
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className={cn("text-base", tone)}>
            {title}
            <span className="ms-2 text-xs font-normal text-muted-foreground tabular-nums">{rows.length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {rows.map((r) => (
              <Row
                key={r.id}
                row={r}
                busy={pending}
                onDone={() => act(() => completeFollowUp(r.id), "اتقفل")}
                onSnooze={() => act(() => snoozeFollowUp(r.id, 3), "اتأجّل ٣ أيام")}
              />
            ))}
          </ul>
        </CardContent>
      </Card>
    );

  if (overdue.length + today.length + upcoming.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-sm font-medium">مافيش حاجة عليكي دلوقتي 🎉</p>
          <p className="mt-1 text-xs text-muted-foreground">
            كل ما تسجّلي متابعة ومعاها موعد، هتلاقيه هنا في يومه.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {group("متأخر", overdue, "text-rose-600 dark:text-rose-400")}
      {group("النهارده", today, "text-amber-600 dark:text-amber-400")}
      {group("جاي", upcoming)}
    </div>
  );
}
