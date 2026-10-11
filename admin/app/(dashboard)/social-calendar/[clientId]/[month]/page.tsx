import { notFound } from "next/navigation";

import { ClientPageHeader } from "../components/client-page-header";
import { canSocial } from "../../helpers/post-permissions";
import { MONTH_LABELS, parseMonthParam, riyadhToday } from "../../helpers/dates";
import { getCalendarClient, getMonthPosts, getYearMonthCounts } from "../../helpers/queries";
import { requireSocialActor } from "../../helpers/require-social-actor";
import { CalendarBoard } from "./components/calendar-board";
import { MonthStrip } from "./components/month-strip";
import { NavIconLinks } from "./components/nav-icon-links";

type Props = { params: Promise<{ clientId: string; month: string }> };

/**
 * التقويم الشهري — الشاشة الرئيسية (القديم `clients/[slug]/calendar/[month]/page.tsx`).
 *
 * الفرق المفروض: الشهر بسنة (`2026-10`) والأيام أيام الشهر الحقيقية، والأزرار تُشتقّ من دور
 * الموظّف (`post-permissions`) — لا زرّ يظهر لما يرفضه الخادم.
 */
export default async function ClientCalendarPage({ params }: Props) {
  const { clientId, month: monthParam } = await params;
  const cm = parseMonthParam(monthParam);
  if (!cm) notFound();

  const actor = await requireSocialActor("view");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;

  const client = await getCalendarClient(clientId);
  if (!client) notFound();

  const [posts, yearCounts] = await Promise.all([
    getMonthPosts(client.id, cm.year, cm.month),
    getYearMonthCounts(client.id, cm.year),
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
      <ClientPageHeader client={client} subtitle="تقويم المحتوى" backHref="/social-calendar">
        <NavIconLinks clientId={client.id} />
      </ClientPageHeader>

      <MonthStrip
        clientId={client.id}
        year={cm.year}
        activeMonth={cm.month}
        counts={yearCounts}
        canCreate={permissions.editBrief}
      />

      <main className="min-h-0 flex-1 overflow-y-auto p-4">
        <CalendarBoard
          key={monthParam}
          posts={posts}
          clientId={client.id}
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
