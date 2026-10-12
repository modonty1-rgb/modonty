"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import type { SocialChannel } from "@prisma/client";
import { ChevronDown, PanelBottomOpen, PanelBottomClose } from "lucide-react";

import { cn } from "@/lib/utils";

import { CHANNEL_ICON, ChannelIcon } from "../../../components/channel-icon";
import { dayName } from "../../../helpers/dates";
import { postHref } from "../../../helpers/post-href";
import type { SocialPostRow } from "../../../helpers/queries";
import { CHANNEL_META, CHANNEL_ORDER, FORMAT_LABEL, STATUS_BADGE, STATUS_DOT, STATUS_LABEL } from "../../../helpers/social-labels";
import type { CalendarPermissions } from "./calendar-board";
import { CreativeCell } from "./creative-cell";
import { PostActions } from "./post-actions";
import { PostDetails } from "./post-details";

export type DayRow = SocialPostRow & { dayIndex: number };

/**
 * الألوان تفصل ثلاث طبقات كانت تتشابه (خالد ١٢ أكتوبر ٢٠٢٦: «تشويش بصري… تمييز بالألوان»):
 *   صفّ اليوم   شريط أغمق + خطّ جانبيّ بلون أخطر ما فيه + تاريخ في مربّع (اليوم ممتلئ)
 *   صفّ المنشور أفتح تحت يومه + خيط بلون حالته + الحالة شارة ملوّنة
 *   التنبيه     شارة ملوّنة لا نصّ
 */
const PILL = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold";
const TONE = {
  red: { pill: "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300", bar: "border-s-red-500" },
  amber: { pill: "bg-amber-500/15 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300", bar: "border-s-amber-500" },
  blue: { pill: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300", bar: "border-s-blue-500" },
  green: { pill: "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300", bar: "border-s-green-500" },
  muted: { pill: "bg-muted text-muted-foreground", bar: "border-s-zinc-300 dark:border-s-zinc-600" },
} as const;
type Tone = keyof typeof TONE;

/** منشور واحد · منشوران · ٣–١٠ منشورات · ١١+ منشوراً. */
export function postsLabel(n: number): string {
  if (n === 1) return "منشور واحد";
  if (n === 2) return "منشوران";
  if (n <= 10) return `${n} منشورات`;
  return `${n} منشوراً`;
}

/**
 * أهمّ تنبيهين في اليوم بهذا الترتيب — كان تنبيهاً واحداً فيُخفي ما بعده
 * (يوم «٢ بلا إبداع» كان يخفي أنّ موعده فات). بلا مشكلة: حالة اليوم.
 */
function dayAlerts(posts: DayRow[], todayIndex: number): { text: string; tone: Tone }[] {
  const count = (test: (p: DayRow) => boolean) => posts.filter(test).length;
  const found = [
    { n: count((p) => p.status !== "PUBLISHED" && p.dayIndex < todayIndex), text: "فات موعدها", tone: "red" as Tone },
    { n: count((p) => p.status === "READY_FOR_REVIEW"), text: "تنتظر المراجعة", tone: "amber" as Tone },
    { n: count((p) => p.assets.length === 0 && p.status !== "PUBLISHED"), text: "بلا إبداع", tone: "amber" as Tone },
  ]
    .filter((a) => a.n > 0)
    .slice(0, 2)
    .map((a) => ({ text: `${a.n} ${a.text}`, tone: a.tone }));
  if (found.length) return found;
  if (posts.every((p) => p.status === "PUBLISHED")) return [{ text: "تم النشر", tone: "green" }];
  if (posts.every((p) => p.status === "READY_TO_PUBLISH" || p.status === "PUBLISHED")) {
    return [{ text: "جاهز للنشر", tone: "blue" }];
  }
  return [{ text: "قيد الإنتاج", tone: "muted" }];
}

/** خطّ اليوم الجانبيّ بلون أخطر ما فيه — أوّل تنبيه هو الأخطر بالترتيب. */
function dayBar(alerts: { tone: Tone }[]): string {
  return TONE[alerts[0]?.tone ?? "muted"].bar;
}

/** خيط المنشور بلون حالته. */
const STATUS_THREAD: Record<SocialPostRow["status"], string> = {
  IN_PRODUCTION: "bg-zinc-300 dark:bg-zinc-600",
  READY_FOR_REVIEW: "bg-amber-400",
  READY_TO_PUBLISH: "bg-blue-500",
  PUBLISHED: "bg-green-500",
};

/** أيقونة القناة في صفّ اليوم — واضحة دائماً، واسمها عند المرور (أيقونات بلا أسماء، خالد ١١ أكتوبر). */
function ChannelBadge({ channel }: { channel: SocialChannel }) {
  const meta = CHANNEL_META[channel];
  const Icon = CHANNEL_ICON[channel];
  return (
    <span title={meta.label} aria-label={meta.label} className={cn("inline-flex h-6 w-6 items-center justify-center rounded", meta.bg, meta.fg)}>
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

/**
 * التقويم صفّاً لكل يوم (موكب خالد وكودكس، ١١ أكتوبر ٢٠٢٦): اليوم · قنواته · عدد منشوراته · أهمّ تنبيه.
 * السهم يفتح اليوم على منشوراته — صفّ لكل منشور والقناة خليّة فيه (لا عناوين قنوات، ولا رأس
 * جدول يتكرّر داخل كل يوم). زرّ «التفاصيل» في آخر صفّ المنشور مختلفٌ عن سهم اليوم ويفتح البريف والأفعال.
 * مع البحث أو أيّ مرشّح تُفتح الأيام المطابقة كلّها تلقائياً كي تظهر النتائج.
 * وبلا مرشّح: اليوم والأيام الستّة بعده مفتوحة من البداية — هي ما يعمل عليه الفريق — و«افتح الكل» للباقي.
 */
export function DaysTable({
  rows,
  year,
  month,
  todayIndex,
  calendarId,
  permissions,
  autoOpen,
  onArchive,
  onChanged,
}: {
  rows: DayRow[];
  year: number;
  month: number;
  todayIndex: number;
  calendarId: string;
  permissions: CalendarPermissions;
  autoOpen: boolean;
  onArchive: (postId: string) => void;
  onChanged: () => void;
}) {
  const days = new Map<number, DayRow[]>();
  for (const r of rows) {
    const d = r.scheduledFor.getUTCDate();
    days.set(d, [...(days.get(d) ?? []), r]);
  }
  const dayList = [...days.entries()].sort((a, b) => a[0] - b[0]);

  const [openDays, setOpenDays] = useState<Set<number>>(
    () =>
      new Set(
        dayList
          .map(([d]) => d)
          .filter((d) => {
            const at = Date.UTC(year, month, d);
            return at >= todayIndex && at < todayIndex + 7 * 86_400_000;
          }),
      ),
  );
  const [openPost, setOpenPost] = useState<string | null>(null);
  const allOpen = autoOpen || dayList.every(([d]) => openDays.has(d));

  function toggleDay(d: number) {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  if (dayList.length === 0) {
    return <p className="rounded-lg border bg-card py-10 text-center text-sm text-muted-foreground">لا منشور يطابق المرشّحات</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b text-start text-[11px] font-semibold text-muted-foreground">
            <th className="w-12 px-3 py-2.5 text-start font-semibold">
              <span className="sr-only">فتح اليوم</span>
            </th>
            <th className="w-36 px-3 py-2.5 text-start font-semibold">اليوم</th>
            <th className="w-40 px-3 py-2.5 text-start font-semibold">القنوات</th>
            <th className="w-40 px-3 py-2.5 text-start font-semibold">المنشورات</th>
            <th className="px-3 py-2.5 text-start font-semibold">
              <span className="flex items-center justify-between gap-2">
                التنبيهات
                {!autoOpen && (
                  <button
                    type="button"
                    onClick={() => setOpenDays(allOpen ? new Set() : new Set(dayList.map(([d]) => d)))}
                    className="rounded-md px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    {allOpen ? "اقفل الكل" : "افتح الكل"}
                  </button>
                )}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {dayList.map(([d, posts]) => {
            const open = autoOpen || openDays.has(d);
            const isToday = Date.UTC(year, month, d) === todayIndex;
            const channels = CHANNEL_ORDER.filter((ch) => posts.some((p) => p.channels.includes(ch)));
            const noChannel = posts.some((p) => p.channels.length === 0);
            const alerts = dayAlerts(posts, todayIndex);
            return (
              <Fragment key={d}>
                <tr
                  className={cn(
                    "cursor-pointer border-b transition-colors",
                    isToday ? "bg-primary/[0.07] hover:bg-primary/10" : "bg-muted/60 hover:bg-muted dark:bg-muted/35 dark:hover:bg-muted/55",
                  )}
                  onClick={() => toggleDay(d)}
                >
                  <td className={cn("border-s-4 px-3 py-2.5", dayBar(alerts))}>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-label={open ? `إغلاق يوم ${d}` : `فتح يوم ${d}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ChevronDown className={cn("h-4 w-4 transition-transform", !open && "rotate-90")} />
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-2.5 tabular-nums">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
                          isToday ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-card text-foreground",
                        )}
                      >
                        {d}
                      </span>
                      <span className={cn("text-xs", isToday ? "font-bold text-primary" : "font-medium text-muted-foreground")}>
                        {isToday ? "اليوم" : dayName(year, month, d)}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="flex flex-wrap items-center gap-1.5">
                      {channels.map((ch) => (
                        <ChannelBadge key={ch} channel={ch} />
                      ))}
                      {noChannel && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-800 dark:text-amber-300">بلا قناة</span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-foreground/80">{postsLabel(posts.length)}</td>
                  <td className="px-3 py-2.5">
                    <span className="flex flex-wrap items-center gap-1.5">
                      {alerts.map((a) => (
                        <span key={a.text} className={cn(PILL, TONE[a.tone].pill)}>
                          {a.text}
                        </span>
                      ))}
                    </span>
                  </td>
                </tr>

                {open &&
                  posts.map((p) => {
                    const links = (p.channelLinks ?? {}) as Partial<Record<string, string>>;
                    const detailsOpen = openPost === p.id;
                    return (
                      <Fragment key={p.id}>
                        <tr className="border-b bg-card transition-colors hover:bg-muted/25">
                          <td className="relative" aria-hidden>
                            <span className={cn("absolute inset-y-1.5 start-[22px] w-[3px] rounded-full", STATUS_THREAD[p.status])} />
                          </td>
                          <td className="px-3 py-2" colSpan={2}>
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="flex shrink-0 items-center gap-1">
                                {p.channels.length ? (
                                  p.channels.map((ch) => <ChannelIcon key={ch} channel={ch} href={links[ch]} />)
                                ) : (
                                  <span className="rounded-full bg-amber-500/15 px-1.5 text-[10px] text-amber-800 dark:text-amber-300">بلا قناة</span>
                                )}
                              </span>
                              <Link
                                href={postHref(calendarId, p.id)}
                                title={p.idea}
                                className="block min-w-0 max-w-[560px] truncate font-medium hover:text-primary hover:underline"
                              >
                                {p.idea || <span className="text-muted-foreground">بدون فكرة</span>}
                              </Link>
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs">
                              <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-semibold", STATUS_BADGE[p.status])}>
                                <span className={cn("size-1.5 rounded-full", STATUS_DOT[p.status])} aria-hidden />
                                {STATUS_LABEL[p.status]}
                              </span>
                              {p.format && <span className="text-muted-foreground">{FORMAT_LABEL[p.format]}</span>}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="flex items-center justify-between gap-2">
                              <CreativeCell post={p} />
                              <button
                                type="button"
                                aria-expanded={detailsOpen}
                                onClick={() => setOpenPost(detailsOpen ? null : p.id)}
                                className={cn(
                                  "inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium transition-colors",
                                  detailsOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                )}
                              >
                                {detailsOpen ? <PanelBottomClose className="h-3.5 w-3.5" /> : <PanelBottomOpen className="h-3.5 w-3.5" />}
                                التفاصيل
                              </button>
                            </span>
                          </td>
                        </tr>
                        {detailsOpen && (
                          <tr className="border-b bg-muted/20">
                            <td colSpan={5} className="p-3">
                              <PostDetails
                                post={p}
                                actions={
                                  <PostActions
                                    post={p}
                                    calendarId={calendarId}
                                    permissions={permissions}
                                    onArchive={() => onArchive(p.id)}
                                    onChanged={onChanged}
                                  />
                                }
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
