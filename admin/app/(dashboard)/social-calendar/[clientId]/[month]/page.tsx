import { notFound } from "next/navigation";
import type { SocialPostStatus } from "@prisma/client";

import { ClientPageHeader } from "../components/client-page-header";
import { canSocial } from "../../helpers/post-permissions";
import { MONTH_LABELS, parseMonthParam, riyadhToday } from "../../helpers/dates";
import { getCalendarClient, getClientStatusTotals, getMonthPosts, getYearMonthCounts } from "../../helpers/queries";
import { requireSocialActor } from "../../helpers/require-social-actor";
import { STATUS_BADGE, STATUS_ORDER } from "../../helpers/social-labels";
import { CalendarTable } from "./components/calendar-table";
import { MonthSidebar } from "./components/month-sidebar";
import { NavIconLinks } from "./components/nav-icon-links";

type Props = { params: Promise<{ clientId: string; month: string }> };

const SHORT_STATUS: Record<SocialPostStatus, string> = {
  IN_PRODUCTION: "قيد الإنتاج",
  READY_FOR_REVIEW: "للمراجعة",
  READY_TO_PUBLISH: "جاهز للنشر",
  PUBLISHED: "تم النشر",
};

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

  const [posts, totals, yearCounts] = await Promise.all([
    getMonthPosts(client.id, cm.year, cm.month),
    getClientStatusTotals(client.id),
    getYearMonthCounts(client.id, cm.year),
  ]);

  // عدّادات الشهر من نفس قائمة الجدول — يستحيل أن يعلن الرأس رقماً يخالف الصفوف.
  const monthCounts = STATUS_ORDER.map((s) => ({ status: s, count: posts.filter((p) => p.status === s).length }));
  const today = riyadhToday();
  const todayDay = today.year === cm.year && today.month === cm.month ? today.day : null;

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
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-[11px]">
          <span className="font-semibold text-foreground">
            {MONTH_LABELS[cm.month]} {cm.year}
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="text-muted-foreground/80">
            <span className="font-bold tabular-nums text-foreground">{posts.length}</span> منشور
          </span>
          <span className="h-3 w-px bg-border" />
          {monthCounts.map(({ status, count }) =>
            count > 0 ? (
              <span
                key={status}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums ${STATUS_BADGE[status]}`}
              >
                <span>{count}</span>
                <span className="font-normal opacity-80">{SHORT_STATUS[status]}</span>
              </span>
            ) : null,
          )}
        </div>

        <div className="h-6 w-px shrink-0 bg-border" />

        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-[11px]">
          <span className="font-medium text-muted-foreground">كل الشهور</span>
          <span className="h-3 w-px bg-border" />
          <span className="text-muted-foreground/80">
            <span className="font-bold tabular-nums text-foreground">{totals.total}</span> منشور
          </span>
          <span className="text-muted-foreground/80">
            <span className="font-bold tabular-nums text-green-600">{totals.PUBLISHED}</span> نُشر
          </span>
          <span className="text-muted-foreground/80">
            <span className="font-bold tabular-nums text-orange-500">{totals.IN_PRODUCTION}</span> قيد الإنتاج
          </span>
        </div>

        <NavIconLinks clientId={client.id} />
      </ClientPageHeader>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <CalendarTable
            key={monthParam}
            posts={posts}
            clientId={client.id}
            clientName={client.name}
            year={cm.year}
            month={cm.month}
            monthLabel={MONTH_LABELS[cm.month]}
            todayDay={todayDay}
            permissions={permissions}
          />
        </main>
        <MonthSidebar
          clientId={client.id}
          year={cm.year}
          activeMonth={cm.month}
          counts={yearCounts}
          canCreate={permissions.editBrief}
        />
      </div>
    </div>
  );
}
