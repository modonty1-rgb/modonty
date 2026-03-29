import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { DashboardLayoutClient } from "./components/dashboard-layout-client";
import { getPendingArticlesCount } from "./dashboard/articles/helpers/article-queries";
import { getPendingCommentsCount } from "./dashboard/comments/helpers/comment-queries";
import { getPendingQuestionsCount } from "./dashboard/questions/helpers/question-queries";
import { getSubscribersCount } from "./dashboard/subscribers/helpers/subscriber-queries";
import { getLeadsCount } from "./dashboard/leads/helpers/lead-queries";
import { getNewSupportMessagesCount } from "./dashboard/support/helpers/support-queries-enhanced";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch {
    redirect("/");
  }

  if (!session?.clientId) {
    redirect("/");
  }

  const clientId = (session as { clientId?: string }).clientId!;
  const clientName = (session as { clientName?: string }).clientName ?? ar.common.clientFallback;

  const [pendingArticlesCount, pendingCommentsCount, pendingQuestionsCount, subscribersCount, leadsCount, pendingSupportCount] =
    await Promise.all([
      getPendingArticlesCount(clientId),
      getPendingCommentsCount(clientId),
      getPendingQuestionsCount(clientId),
      getSubscribersCount(clientId),
      getLeadsCount(clientId),
      getNewSupportMessagesCount(clientId),
    ]);

  return (
    <DashboardLayoutClient
      clientName={clientName}
      pendingArticlesCount={pendingArticlesCount}
      pendingCommentsCount={pendingCommentsCount}
      pendingQuestionsCount={pendingQuestionsCount}
      subscribersCount={subscribersCount}
      leadsCount={leadsCount}
      pendingSupportCount={pendingSupportCount}
    >
      {children}
    </DashboardLayoutClient>
  );
}
