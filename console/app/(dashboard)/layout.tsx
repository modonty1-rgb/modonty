import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { getYmylAuthorityCodes } from "@modonty/shared/lib/seo/ymyl-authorities";
import { getClientSubscription } from "@/lib/subscription/get-client-subscription";
import {
  formatCurrencyTotals,
  getOutstandingInvoices,
  resolveClientPayment,
} from "@/lib/payments";
import { isYmylClientComplete } from "@/lib/seo/ymyl-helpers";
import {
  statusLabel,
  paymentLabel,
  subscriptionProgress,
  formatSubscriptionDate,
} from "@/lib/subscription";
import { DashboardLayoutClient } from "./components/dashboard-layout-client";
import { ImpersonationBanner } from "./components/impersonation-banner";
import { AccountNotice } from "./dashboard/components/account-notice";
import {
  getPendingArticlesCount,
  canSeeSiteArticles,
} from "./dashboard/articles/helpers/article-queries";
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
import { getMediaSectionCounts } from "./dashboard/reels/helpers/reel-queries";

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

  const [client, sub, outstanding, pendingArticlesCount, pendingCommentsCount, pendingQuestionsCount, subscribersCount, leadsCount, newBookingsCount, pendingSupportCount, faqStats, pendingPageFaqsCount, pendingClientCommentsCount, pendingClientReviewsCount, mediaCounts, clientCanSeeSiteArticles] =
    await Promise.all([
      db.client.findUnique({
        where: { id: clientId },
        select: {
          name: true,
          logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
          isYmyl: true,
          // The YMYL badge is only alarming while data is actually missing — these three
          // decide that. Without them the badge stayed red forever and clients reported
          // "I filled everything and the warning is still there" (2026-08-04).
          ymylCategory: true,
          ymylData: true,
          addressCountry: true,
          // The public page link now lives in the sidebar on every screen, so the layout
          // needs the same two fields the profile page uses to build it.
          canonicalUrl: true,
          slug: true,
        },
      }),
      // الاشتراكُ من الطلب الساري — نفسُ مصدر صفحة الإعدادات، فلا يختلف الشريطُ عنها.
      getClientSubscription(clientId),
      // المستحقّاتُ بقاعدة `collected.ts`، لكلّ عملةٍ وحدها — نفسُ مصدر الإعدادات والفواتير.
      getOutstandingInvoices(clientId),
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
      getMediaSectionCounts(clientId),
      canSeeSiteArticles(clientId),
    ]);
  const pendingFaqsCount = faqStats.pending;
  const clientLogoUrl = mediaSrc(client?.logoMedia);
  const isYmyl = client?.isYmyl ?? false;
  // Same derivation as the profile page: an explicit canonical wins, else build it
  // from the slug.
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
  const publicPageUrl =
    client?.canonicalUrl || (client?.slug ? `${SITE_URL}/clients/${client.slug}` : null);

  // Complete = every required field of the client's YMYL category is filled and valid.
  // Same helper the save action and the publish gate use, so the badge can never
  // disagree with what the rest of the system considers done — and the authority list
  // comes from the same Reference Data rows that built the dropdown the client chose from.
  const ymylAuthorityCodes = isYmyl
    ? await getYmylAuthorityCodes(client?.addressCountry, client?.ymylCategory)
    : [];
  const ymylComplete =
    isYmyl &&
    isYmylClientComplete(
      {
        isYmyl,
        ymylCategory: client?.ymylCategory ?? null,
        ymylData: client?.ymylData ?? null,
        addressCountry: client?.addressCountry ?? null,
      },
      ymylAuthorityCodes
    );
  // Read the client name LIVE from the DB (same source as the dashboard greeting) so the
  // sidebar header + impersonation banner never show a stale name baked into the JWT at login.
  const clientName = client?.name ?? ar.common.clientFallback;
  // شارةُ الدفع من الطلب الساري والمستحقّات معاً — `resolveClientPayment`، نفسُ قاعدة الإعدادات
  // (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد). والشريطُ يقول ما تقوله الإعدادات حرفاً — «مدفوع» معها.
  const paymentKey = resolveClientPayment(sub.order, outstanding.count);

  // Derived on the server: the sidebar is a client component, and computing "days left"
  // there would let the rendered number depend on the visitor's clock.
  const subscription = {
    // اسم الباقة من الطلب الساري — لقطةٌ مجمّدة يوم الشراء لا الكتالوج الحيّ.
    tierName: sub.order?.planName ?? "—",
    status: statusLabel(sub.status),
    payment: paymentLabel(paymentKey),
    progress: subscriptionProgress(sub.startedAt, sub.endsAt),
    endDate: formatSubscriptionDate(sub.endsAt),
    siteArticlesEnabled: clientCanSeeSiteArticles,
  };

  return (
    <>
      {impersonated && <ImpersonationBanner clientName={clientName} />}
      <DashboardLayoutClient
      accountNotice={
        <AccountNotice
          endDate={sub.endsAt}
          unpaidCount={outstanding.count}
          unpaidTotal={formatCurrencyTotals(outstanding.totals, " و")}
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
      galleryCount={mediaCounts.gallery}
      reelsCount={mediaCounts.images}
      videosCount={mediaCounts.videos}
      isYmyl={isYmyl}
      ymylComplete={ymylComplete}
      publicPageUrl={publicPageUrl}
      subscription={subscription}
    >
      {children}
    </DashboardLayoutClient>
    </>
  );
}
