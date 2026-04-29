import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { db } from "@/lib/db";
import { DashboardLayoutClient } from "./components/dashboard-layout-client";
import { getPendingArticlesCount } from "./dashboard/articles/helpers/article-queries";
import { getPendingCommentsCount } from "./dashboard/comments/helpers/comment-queries";
import { getPendingQuestionsCount } from "./dashboard/questions/helpers/question-queries";
import { getSubscribersCount } from "./dashboard/subscribers/helpers/subscriber-queries";
import { getLeadsCount } from "./dashboard/leads/helpers/lead-queries";
import { getNewSupportMessagesCount } from "./dashboard/support/helpers/support-queries-enhanced";
import { getFaqStats } from "./dashboard/faqs/helpers/faq-queries";
import { getPendingClientCommentsCount } from "./dashboard/client-comments/helpers/client-comment-queries";

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

  const [client, pendingArticlesCount, pendingCommentsCount, pendingQuestionsCount, subscribersCount, leadsCount, pendingSupportCount, faqStats, pendingClientCommentsCount] =
    await Promise.all([
      db.client.findUnique({
        where: { id: clientId },
        select: { logoMedia: { select: { url: true } } },
      }),
      getPendingArticlesCount(clientId),
      getPendingCommentsCount(clientId),
      getPendingQuestionsCount(clientId),
      getSubscribersCount(clientId),
      getLeadsCount(clientId),
      getNewSupportMessagesCount(clientId),
      getFaqStats(clientId),
      getPendingClientCommentsCount(clientId),
    ]);
  const pendingFaqsCount = faqStats.pending;
  const clientLogoUrl = client?.logoMedia?.url ?? null;

  return (
    <DashboardLayoutClient
      clientName={clientName}
      clientLogoUrl={clientLogoUrl}
      pendingArticlesCount={pendingArticlesCount}
      pendingCommentsCount={pendingCommentsCount}
      pendingQuestionsCount={pendingQuestionsCount}
      subscribersCount={subscribersCount}
      leadsCount={leadsCount}
      pendingSupportCount={pendingSupportCount}
      pendingFaqsCount={pendingFaqsCount}
      pendingClientCommentsCount={pendingClientCommentsCount}
    >
      {children}
    </DashboardLayoutClient>
  );
}
