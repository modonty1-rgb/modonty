import Link from "next/link";
import { Calendar } from "lucide-react";

import { formatMonthParam, riyadhToday } from "../helpers/dates";
import { canSocial } from "../helpers/post-permissions";
import { getArchivedCalendars, getCalendars, type CalendarKind } from "../helpers/queries";
import { requireSocialActor } from "../helpers/require-social-actor";
import { ArchivedCalendars } from "./archived-calendars";
import { ClientsView } from "./clients-view";

const COPY: Record<CalendarKind, { title: string; subtitle: string; unit: string }> = {
  content: { title: "المحتوى", subtitle: "كاليندرات المحتوى — كل عميل مفعّل له كاليندر تلقائياً", unit: "كاليندر" },
  social: { title: "السوشيال ميديا", subtitle: "كاليندرات السوشيال ميديا للميديا باير", unit: "كاليندر" },
};

/**
 * لوحة قسمٍ من Social Calendar — كروت/جدول، وكل كرت يفتح كاليندره (خالد ١١ أكتوبر ٢٠٢٦).
 * القسم من نوع الكاليندر. التأسيس من «New Calendar» في القائمة الجانبية.
 */
export async function CalendarsHome({ kind }: { kind: CalendarKind }) {
  const actor = await requireSocialActor("view");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;

  const [calendars, archived] = await Promise.all([getCalendars(kind), getArchivedCalendars(kind)]);
  const today = riyadhToday();
  const currentMonth = formatMonthParam(today.year, today.month);
  const copy = COPY[kind];

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      {/* التأسيس من «New Calendar» في القائمة الجانبية وحدها (خالد ١٢ أكتوبر ٢٠٢٦) — والرأس أصغر ليأخذ الجدول المساحة. */}
      <header className="rounded-xl border border-border bg-card px-5 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{copy.title}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{copy.subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="tabular-nums">
              {calendars.length} {copy.unit}
            </span>
          </div>
        </div>
      </header>

      {calendars.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-24 text-center">
          {kind === "content" ? (
            <>
              <p className="text-lg font-semibold text-foreground">لا كاليندرات محتوى بعد</p>
              <p className="text-sm text-muted-foreground">
                فعّل العميل من صفحة{" "}
                <Link href="/clients" className="text-primary underline">
                  Clients
                </Link>{" "}
                أو أسّس كاليندراً من «New Calendar» في القائمة الجانبية.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-foreground">لا كاليندرات بعد</p>
              <p className="text-sm text-muted-foreground">أسّس أوّل كاليندر من «New Calendar» في القائمة الجانبية.</p>
            </>
          )}
        </div>
      ) : (
        <ClientsView clients={calendars} currentMonth={currentMonth} canArchive={canSocial(actor.role, "archive")} />
      )}

      <ArchivedCalendars calendars={archived} canRestore={canSocial(actor.role, "archive")} />
    </div>
  );
}
