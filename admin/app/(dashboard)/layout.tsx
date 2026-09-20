import { redirect } from "next/navigation";
import { planDocuments } from "./migrations/helpers/plan-documents";
import { checkOrdersMigrationGate } from "@/lib/orders-migration-gate";
import { checkAdmin } from "@/lib/admin-guard";
import { canSeeReports } from "@/lib/can-see-reports";
import { db } from "@/lib/db";
import { TASK_NOT_ARCHIVED } from "@/lib/tasks/not-archived";
import { Sidebar } from "@/components/admin/sidebar";
import { Header } from "@/components/admin/header";
import { DbBadge } from "@/components/admin/db-badge";
import { SidebarProvider } from "@/components/contexts/sidebar-context";
import { NotAuthorized } from "./components/not-authorized";
import { getArticleStatusCounts } from "./actions/article-status-counts";
import { getMissingEssentialSeoFields } from "@/lib/seo/essential-seo-fields";
import { EssentialSeoDialog } from "@/components/admin/essential-seo-dialog";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative gate for the /dashboard tree: authenticated AND role === ADMIN.
  // Unauthenticated → /login. Signed-in non-admin → render NotAuthorized inline
  // (redirecting to /login would loop, since /login bounces any session to "/").
  const gate = await checkAdmin();
  if (gate.status === "unauthenticated") {
    redirect("/login");
  }
  if (gate.status === "forbidden") {
    return <NotAuthorized />;
  }

  // Fetch article status counts once at layout level → passed to Sidebar as a prop
  // so workflow nav items can show live count badges. Cached 60s via unstable_cache.
  const articleStatusCounts = await getArticleStatusCounts().catch(() => null);

  // Essential SEO/brand fields live in Settings (single source of truth). If any is
  // empty, alert the admin with a clear dialog instead of silently using a fallback.
  const missingSeoFields = await getMissingEssentialSeoFields().catch(() => []);

  // Whether to show the Report link. Read on the SERVER because the permission now lives
  // on the staff row, and the session token carries only the role — a token minted before
  // the box was ticked would keep the link hidden until the next sign-in. The proxy and the
  // page enforce the same rule; this only decides whether a link is drawn.
  // بندُ «Orders Migration» يُرسم ما دام الترحيل متاحاً — نفسُ الشرط الذي يطبّقه
  // المسارُ والصفحة، مقروءاً هنا مرّةً واحدة لكلّ صفحة (خالد ١٨ سبتمبر ٢٠٢٦:
  // «مجرّد ما أسوّي الترحيل يختفي»).
  /**
   * يُرسم البندُ ما دام **أيُّ** ترحيلٍ مفتوحاً (خالد ١٩ سبتمبر ٢٠٢٦: جمعُ الترحيلين في
   * صفحةٍ واحدة). وكان الشرطُ ترحيلَ الطلبات وحده، فلمّا تمّ اختفى البندُ ومعه ترحيلُ
   * الوثائق الذي لم يُجرَ بعد — رابطٌ يموت وفيه عملٌ باق.
   */
  const [ordersOpen, pendingDocs] = await Promise.all([
    checkOrdersMigrationGate().then((g) => g.allowed).catch(() => false),
    planDocuments().then((p) => p.candidates.length).catch(() => 0),
  ]);
  const ordersMigrationOpen = ordersOpen || pendingDocs > 0;

  const reportViewer = await db.staff
    .findUnique({ where: { id: gate.userId }, select: { role: true, canViewReports: true } })
    .catch(() => null);

  /**
   * **عدّادُ مهامّي — على زرّ Tasks في الشريط** (خالد ٢٠ سبتمبر ٢٠٢٦: «حطّ لي بادج عند
   * التاسكات فوق، أعرف كم تاسك عندي»).
   *
   * «عندي» = المُسنَدة إليّ أنا، لا كلُّ ما على اللوحة. و«مفتوحة» = ما لم يصل `DONE`:
   * `TODO` و`IN_PROGRESS` و`REVIEW` كلُّها عملٌ لم ينتهِ. وعدٌّ يشمل المنتهي يجعل الرقم
   * يكبر أبداً ولا يُنظر إليه.
   *
   * ويُقرأ هنا لا في المكوّن: الزرُّ عميلٌ (`"use client"`)، وقراءةُ القاعدة منه تعني
   * نداءً من المتصفّح في كلّ صفحة. والتخطيطُ يُرسم مرّةً ويمرّره.
   */
  const myOpenTasks = await db.task
    .count({ where: { assigneeId: gate.userId, status: { not: "DONE" }, ...TASK_NOT_ARCHIVED } })
    .catch(() => 0);

  return (
    <SidebarProvider>
      <EssentialSeoDialog missing={missingSeoFields} />
      <div className="flex h-screen bg-background">
        <Sidebar articleStatusCounts={articleStatusCounts} showOrdersMigration={ordersMigrationOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* The sync tool writes only to the test database, so its button follows the
              database this instance is on — read here on the server, never in the bundle. */}
          <Header
            dbBadge={<DbBadge />}
            canSyncLocal={(process.env.DATABASE_URL ?? "").includes("modonty_dev")}
            canViewReports={canSeeReports(reportViewer)}
            myOpenTasks={myOpenTasks}
          />
          <main className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
