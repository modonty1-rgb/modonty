import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";

import { ClientPageHeader } from "../components/client-page-header";
import { canSocial } from "../../helpers/post-permissions";
import { MONTH_LABELS, formatMonthParam, parseMonthParam, riyadhToday } from "../../helpers/dates";
import { getCalendar, getCalendarDesigners, getMonthPosts, getYearMonthCounts } from "../../helpers/queries";
import { calendarHomeHref } from "../../helpers/post-href";
import { CalendarSettingsDialog } from "../../components/calendar-settings-dialog";
import { requireSocialActor } from "../../helpers/require-social-actor";
import { CalendarBoard } from "./components/calendar-board";
import { MonthToggle } from "./components/month-toggle";
import { NavIconLinks } from "./components/nav-icon-links";

type Props = { params: Promise<{ calendarId: string; month: string }> };

/**
 * التقويم الشهري — الشاشة الرئيسية (القديم `clients/[slug]/calendar/[month]/page.tsx`).
 *
 * الفرق المفروض: الشهر بسنة (`2026-10`) والأيام أيام الشهر الحقيقية، والأزرار تُشتقّ من دور
 * الموظّف (`post-permissions`) — لا زرّ يظهر لما يرفضه الخادم.
 */
export default async function ClientCalendarPage({ params }: Props) {
  const { calendarId, month: monthParam } = await params;
  const cm = parseMonthParam(monthParam);
  if (!cm) notFound();

  const actor = await requireSocialActor("view");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;

  const calendar = await getCalendar(calendarId);
  if (!calendar) notFound();

  const canEdit = canSocial(actor.role, "editBrief");
  const [posts, yearCounts, designers] = await Promise.all([
    getMonthPosts(calendar.id, cm.year, cm.month),
    getYearMonthCounts(calendar.id, cm.year),
    canEdit ? getCalendarDesigners() : [],
  ]);
  const today = riyadhToday();

  const permissions = {
    editBrief: canSocial(actor.role, "editBrief"),
    produce: canSocial(actor.role, "produce"),
    review: canSocial(actor.role, "review"),
    publish: canSocial(actor.role, "publish"),
    archive: canSocial(actor.role, "archive"),
  };

  return (
    <div className="-m-4 flex h-[calc(100%+2rem)] flex-col bg-background sm:-m-6 sm:h-[calc(100%+3rem)]">
      {/* الشهر قائمة بجانب العميل و«منشور جديد» في الرأس (موكب ١١ أكتوبر ٢٠٢٦) — شريط الشهور `month-strip.tsx` خرج من الصفحة. */}
      <ClientPageHeader
        calendar={calendar}
        subtitle={calendar.kind === "SOCIAL" ? "تقويم السوشيال ميديا" : "تقويم المحتوى"}
        backHref={calendarHomeHref(calendar)}
      >
        {canEdit && (
          <CalendarSettingsDialog
            calendarId={calendar.id}
            initialKind={calendar.kind}
            initialName={calendar.name}
            nameEditable={!calendar.clientId}
            initialDesignerId={calendar.designerId}
            reviewNote={calendar.reviewNote}
            canArchive={permissions.archive}
            designers={designers}
          />
        )}
        <NavIconLinks calendarId={calendar.id} />
        {permissions.editBrief && (
          <Link
            href={`/social-calendar/${calendar.id}/${formatMonthParam(cm.year, cm.month)}/new`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            منشور جديد
          </Link>
        )}
      </ClientPageHeader>

      <main className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <MonthToggle calendarId={calendar.id} year={cm.year} activeMonth={cm.month} counts={yearCounts} />
        <CalendarBoard
          key={monthParam}
          posts={posts}
          calendarId={calendar.id}
          year={cm.year}
          month={cm.month}
          monthLabel={MONTH_LABELS[cm.month]}
          today={today}
          permissions={permissions}
        />
      </main>
    </div>
  );
}
