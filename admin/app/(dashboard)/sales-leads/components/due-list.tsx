"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  StickyNote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { completeFollowUp, snoozeFollowUp } from "../actions";
import { formatCount } from "../helpers/format-count";
import {
  CHANNEL_LABEL,
  DUE_TONE,
  STAGE_DOT,
  STAGE_LABEL,
  describeDue,
  waNumber,
  type Channel,
} from "../helpers/funnel";
import type { FollowUpTimelineRow, LeadJourney } from "../helpers/get-due-follow-ups";

const dayFmt = new Intl.DateTimeFormat("ar-EG", {
  day: "numeric",
  month: "long",
  timeZone: "Asia/Riyadh",
});

const timeFmt = new Intl.DateTimeFormat("ar-EG", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Riyadh",
});

const CHANNEL_ICON: Record<string, typeof PhoneCall> = {
  CALL: PhoneCall,
  WHATSAPP: MessageCircle,
  EMAIL: Mail,
  MEETING: CalendarDays,
  VISIT: MapPin,
  NOTE: StickyNote,
};

type LeadTimeline = LeadJourney & { next: FollowUpTimelineRow | null };

function prepareJourneys(leads: LeadJourney[]): LeadTimeline[] {
  return leads
    .map((lead) => ({
      ...lead,
      followUps: [...lead.followUps].sort((a, b) => b.happenedAt.getTime() - a.happenedAt.getTime()),
      next: lead.followUps
        .filter((row) => row.nextActionAt !== null && row.doneAt === null)
        .sort((a, b) => a.nextActionAt!.getTime() - b.nextActionAt!.getTime())[0] ?? null,
    }))
    .sort((a, b) => (a.next?.nextActionAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.next?.nextActionAt?.getTime() ?? Number.MAX_SAFE_INTEGER));
}

function TimelineEvent({ row, lead, onDone, onSnooze, busy, isLast }: {
  row: FollowUpTimelineRow;
  lead: LeadJourney;
  onDone: () => void;
  onSnooze: () => void;
  busy: boolean;
  isLast: boolean;
}) {
  const due = row.nextActionAt ? describeDue(row.nextActionAt) : null;
  const waDigits = waNumber(lead.phone, lead.countryCode);
  const ChannelIcon = CHANNEL_ICON[row.channel] ?? StickyNote;

  return (
    <li className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 pb-5 last:pb-0">
      <div className="relative flex w-6 justify-center" aria-hidden>
        <span className="mt-1.5 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground">
          <ChannelIcon className="size-3.5" />
        </span>
        {!isLast && <span className="absolute bottom-0 top-8 w-px bg-border" />}
      </div>

      <div className="min-w-0 rounded-lg border bg-muted/[0.16] px-3 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="font-medium text-foreground">
              {CHANNEL_LABEL[row.channel as Channel] ?? "ملاحظة"}
            </span>
            <span className="text-muted-foreground">
              {dayFmt.format(row.happenedAt)} · {timeFmt.format(row.happenedAt)}
            </span>
          </div>
          <span className={cn("shrink-0 text-xs font-medium", due ? DUE_TONE[due.tone] : "text-muted-foreground")}>
            {due ? `${due.text} · ${dayFmt.format(row.nextActionAt!)}` : row.doneAt ? "تمت المتابعة" : "بدون موعد تالٍ"}
          </span>
        </div>

        <p className="mt-1.5 text-sm leading-6 text-foreground/90">{row.body}</p>
        {row.nextActionNote && (
          <p className="mt-1 text-xs text-muted-foreground">الخطوة القادمة: {row.nextActionNote}</p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t pt-2">
          {lead.phone && (
            <>
              <a href={`tel:${lead.phone}`} aria-label={`اتّصلي بـ${lead.name}`}>
                <Button type="button" variant="outline" size="sm" className="h-8 gap-1 px-2 text-xs">
                  <Phone className="size-3.5" aria-hidden /> اتّصلي
                </Button>
              </a>
              {waDigits && (
                <a
                  href={`https://wa.me/${waDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`واتساب ${lead.name}`}
                >
                  <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs text-emerald-700 dark:text-emerald-400">
                    <MessageCircle className="size-3.5" aria-hidden /> واتساب
                  </Button>
                </a>
              )}
            </>
          )}
          {row.nextActionAt && !row.doneAt && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ms-auto h-8 gap-1 px-2 text-xs"
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
            </>
          )}
        </div>
      </div>
    </li>
  );
}

function LeadTimelineCard({ lead, onDone, onSnooze, busy }: {
  lead: LeadTimeline;
  onDone: (id: string) => void;
  onSnooze: (id: string) => void;
  busy: boolean;
}) {
  const due = lead.next?.nextActionAt ? describeDue(lead.next.nextActionAt) : null;
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            aria-label={`${open ? "طي" : "عرض"} متابعات ${lead.name}`}
          >
            <span className={cn("size-2 shrink-0 rounded-full", STAGE_DOT[lead.stage])} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-semibold">{lead.name}</span>
                {lead.company && <span className="text-xs font-normal text-muted-foreground">{lead.company}</span>}
                <span className="text-[11px] font-normal text-muted-foreground">
                  {STAGE_LABEL[lead.stage]}
                </span>
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                <Clock3 className="size-3 shrink-0" aria-hidden />
                {due ? (
                  <>
                    الموعد القادم: <span className={cn("font-medium", DUE_TONE[due.tone])}>{due.text}</span>
                    <span>· {dayFmt.format(lead.next!.nextActionAt!)}</span>
                    {lead.next?.nextActionNote && <span className="truncate">· {lead.next.nextActionNote}</span>}
                  </>
                ) : "لا يوجد موعد مفتوح"}
              </span>
            </span>
            <span className="hidden shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground sm:inline">
              {formatCount(lead.followUps.length)} متابعة
            </span>
            <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-4 py-4">
            <div className="mb-3 flex items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground">أحدث تواصلات العميل</span>
              <Link
                href={`/sales-leads/${lead.id}`}
                className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                افتحي ملف العميل
              </Link>
            </div>
            <ol aria-label={`سجل متابعات ${lead.name}`}>
              {lead.followUps.length > 0 ? lead.followUps.map((row, index) => (
                <TimelineEvent
                  key={row.id}
                  row={row}
                  lead={lead}
                  busy={busy}
                  isLast={index === lead.followUps.length - 1}
                  onDone={() => {
                    if (row.nextActionAt && !row.doneAt) onDone(row.id);
                  }}
                  onSnooze={() => {
                    if (row.nextActionAt && !row.doneAt) onSnooze(row.id);
                  }}
                />
              )) : <li className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">لا توجد متابعات مسجلة بعد.</li>}
            </ol>
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

interface Props {
  leads: LeadJourney[];
}

/**
 * كل عميل غير مفقود مجموعة مستقلة؛ لا فلترة بتاريخ أو بالمستخدم الحالي.
 */
export function DueList({ leads: sourceLeads }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const leads = useMemo(() => prepareJourneys(sourceLeads), [sourceLeads]);

  const act = (fn: () => Promise<{ success: boolean; error?: string }>, okText: string) =>
    start(async () => {
      const r = await fn();
      if (r.success) {
        toast({ title: okText, variant: "success" });
        router.refresh();
      } else {
        toast({ title: r.error ?? "ما نجح.", variant: "destructive" });
      }
    });

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-sm font-medium">لا يوجد عملاء في التقرير</p>
          <p className="mt-1 text-xs text-muted-foreground">
            سيظهر هنا كل عميل غير مفقود مع رحلة متابعاته كاملة.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {formatCount(leads.length)} عميل غير مفقود — رحلة العميل كاملة، مرتبة بأقرب موعد مفتوح ثم آخر تحديث.
      </p>
      {leads.map((lead) => (
        <LeadTimelineCard
          key={lead.id}
          lead={lead}
          busy={pending}
          onDone={(id) => act(() => completeFollowUp(id), "أُغلق")}
          onSnooze={(id) => act(() => snoozeFollowUp(id, 3), "تأجيل ٣ أيام")}
        />
      ))}
    </div>
  );
}
