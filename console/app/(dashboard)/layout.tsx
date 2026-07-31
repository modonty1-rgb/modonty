import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/database/lib/media-src";
import { DashboardLayoutClient } from "./components/dashboard-layout-client";
import { ImpersonationBanner } from "./components/impersonation-banner";
import { AccountNotice } from "./dashboard/components/account-notice";
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
  const impersonated = (session as { impersonated?: boolean }).impersonated ?? false;

  const [client, pendingArticlesCount, pendingCommentsCount, pendingQuestionsCount, subscribersCount, leadsCount, newBookingsCount, pendingSupportCount, faqStats, pendingPageFaqsCount, pendingClientCommentsCount, pendingClientReviewsCount] =
    await Promise.all([
      db.client.findUnique({
        where: { id: clientId },
        select: {
          name: true,
          logoMedia: { select: { url: true, bunnyUrl: true } },
          isYmyl: true,
          // Feeds the account notice — it lives in the layout so it follows the client
          // to every page, not just the dashboard home (Khalid 2026-07-24).
          subscriptionEndDate: true,
          invoices: {
            // `archivedAt: null` matches nothing on Mongo for rows written before the
            // field existed — it must be paired with `isSet: false` or the notice goes
            // blank for every client with legacy invoices.
            where: {
              NOT: { paymentStatus: "PAID" },
              OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
            },
            select: { amount: true, currency: true },
          },
        },
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
  const clientLogoUrl = mediaSrc(client?.logoMedia);
  const isYmyl = client?.isYmyl ?? false;
  // Read the client name LIVE from the DB (same source as the dashboard greeting) so the
  // sidebar header + impersonation banner never show a stale name baked into the JWT at login.
  const clientName = client?.name ?? ar.common.clientFallback;
  const openInvoices = client?.invoices ?? [];

  return (
    <>
      {impersonated && <ImpersonationBanner clientName={clientName} />}
      <DashboardLayoutClient
      accountNotice={
        <AccountNotice
          endDate={client?.subscriptionEndDate ?? null}
          unpaidCount={openInvoices.length}
          unpaidAmount={openInvoices.reduce((s, i) => s + i.amount, 0)}
          unpaidCurrency={openInvoices[0]?.currency ?? null}
        />
      }
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
