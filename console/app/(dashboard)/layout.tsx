import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { db } from "@/lib/db";
import { DashboardLayoutClient } from "./components/dashboard-layout-client";
import { ImpersonationBanner } from "./components/impersonation-banner";
import { getPendingArticlesCount } from "./dashboard/articles/helpers/article-queries";
import { getPendingCommentsCount } from "./dashboard/comments/helpers/comment-queries";
import { getPendingQuestionsCount } from "./dashboard/questions/helpers/question-queries";
import { getSubscribersCount } from "./dashboard/subscribers/helpers/subscriber-queries";
import { getLeadsCount } from "./dashboard/leads/helpers/lead-queries";
import { getNewBookingsCount } from "./dashboard/bookings/helpers/booking-queries";
import { getNewSupportMessagesCount } from "./dashboard/support/helpers/support-queries-enhanced";
import { getFaqStats } from "./dashboard/faqs/helpers/faq-queries";
import { getPendingPageFaqCount } from "./dashboard/page-faq/helpers/page-faq-queries";
import { getPendingClientCommentsCount } from "./dashboard/client-comments/helpers/client-comment-queries";
import { getPendingClientReviewsCount } from "./dashboard/client-reviews/helpers/client-review-queries";

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
  const impersonated = (session as { impersonated?: boolean }).impersonated ?? false;

  const [client, pendingArticlesCount, pendingCommentsCount, pendingQuestionsCount, subscribersCount, leadsCount, newBookingsCount, pendingSupportCount, faqStats, pendingPageFaqsCount, pendingClientCommentsCount, pendingClientReviewsCount] =
    await Promise.all([
      db.client.findUnique({
        where: { id: clientId },
        select: { logoMedia: { select: { url: true } }, isYmyl: true },
      }),
      getPendingArticlesCount(clientId),
      getPendingCommentsCount(clientId),
      getPendingQuestionsCount(clientId),
      getSubscribersCount(clientId),
      getLeadsCount(clientId),
      getNewBookingsCount(clientId),
      getNewSupportMessagesCount(clientId),
      getFaqStats(clientId),
      getPendingPageFaqCount(clientId),
      getPendingClientCommentsCount(clientId),
      getPendingClientReviewsCount(clientId),
    ]);
  const pendingFaqsCount = faqStats.pending;
  const clientLogoUrl = client?.logoMedia?.url ?? null;
  const isYmyl = client?.isYmyl ?? false;

  return (
    <>
      {impersonated && <ImpersonationBanner clientName={clientName} />}
      <DashboardLayoutClient
      clientName={clientName}
      clientLogoUrl={clientLogoUrl}
      pendingArticlesCount={pendingArticlesCount}
      pendingCommentsCount={pendingCommentsCount}
      pendingQuestionsCount={pendingQuestionsCount}
      subscribersCount={subscribersCount}
      leadsCount={leadsCount}
      newBookingsCount={newBookingsCount}
      pendingSupportCount={pendingSupportCount}
      pendingFaqsCount={pendingFaqsCount}
      pendingPageFaqsCount={pendingPageFaqsCount}
      pendingClientCommentsCount={pendingClientCommentsCount}
      pendingClientReviewsCount={pendingClientReviewsCount}
      isYmyl={isYmyl}
    >
      {children}
    </DashboardLayoutClient>
    </>
  );
}
