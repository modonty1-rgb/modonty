import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { articleStatusCounts, clientStatusCounts, contentPagesSeoAudit, listingPagesSeoAudit, memberCounts, sectorPagesSeoAudit, visitorActionsSummary } from "@/lib/dashboard/cached";
import { getErrorsToFix } from "./actions/errors-to-fix";
import { DashboardTabs } from "./components/dashboard-tabs";
import { PlatformSeoOverall } from "./components/sections/platform-seo-overall";
import { GoogleSearchCard } from "./components/sections/google-search-card";
import { TodayHeader, TodayList } from "./components/sections/today-list";
import { NumbersCard } from "./components/sections/numbers-card";
import { SeoSummaryCard } from "./components/sections/seo-summary-card";
import { ArticlesPipeline } from "./components/sections/articles-pipeline";
import { ClientsPipeline } from "./components/sections/clients-pipeline";
import { VisitorActionsBreakdown } from "./components/sections/visitor-actions-breakdown";
import { MembersPipeline } from "./components/sections/members-pipeline";
import { SubscribersPipeline } from "./components/sections/subscribers-pipeline";
import { NewsletterPipeline } from "./components/sections/newsletter-pipeline";
import { ListingPagesSeo } from "./components/sections/listing-pages-seo";
import { MediaLibrary } from "./components/sections/media-library";
import { ReferenceData } from "./components/sections/reference-data";
import { ErrorsToFix } from "./components/sections/errors-to-fix";

/**
 * The dashboard — redesigned 30 Sep 2026 (Khalid approved the mockup
 * `documents/HTML/admin-dashboard-mockup.html`, in Arabic).
 *
 * Fourteen stacked English sections (~5,300px open, numbers without labels, the same
 * number in two or three places) became four blocks: what needs you today, the numbers,
 * SEO health, and the detail as tabs. Every number, link and fix button of the old page
 * is kept — measured against it before building (123/123 data points, 91/91 links).
 */
export default async function DashboardPage() {
  // Tab counts — the same cached fetches the panels read, so a tab never disagrees with itself.
  const [articles, clients, va, members, listing, content, sectors, errors] = await Promise.all([
    articleStatusCounts(),
    clientStatusCounts(),
    visitorActionsSummary(),
    memberCounts(),
    listingPagesSeoAudit(),
    contentPagesSeoAudit(),
    sectorPagesSeoAudit(),
    getErrorsToFix(),
  ]);
  const c = (v: number) => v.toLocaleString("en-US");
  const articleTotal = Object.values(articles).reduce((s, v) => s + v, 0);
  const errorTotal = errors.reduce((s, e) => s + e.items.length, 0);

  const panel = (node: React.ReactNode, h = "h-64") => <Suspense fallback={<Skeleton className={`${h} w-full`} />}>{node}</Suspense>;

  return (
    <div dir="rtl" className="mx-auto max-w-[1280px] space-y-4">
      <Suspense fallback={<Skeleton className="h-14 w-full" />}>
        <TodayHeader />
      </Suspense>

      {/* The one platform number — Modonty's overall SEO, on top as before. */}
      <Suspense fallback={<Skeleton className="h-20 w-full rounded-2xl" />}>
        <PlatformSeoOverall />
      </Suspense>

      {/* modonty.com in Google Search — impressions, clicks, CTR, position (Khalid, 1 Oct 2026). */}
      <Suspense fallback={<Skeleton className="h-44 w-full rounded-xl" />}>
        <GoogleSearchCard />
      </Suspense>

      <div className="grid items-start gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Suspense fallback={<Skeleton className="h-[480px] w-full rounded-xl" />}>
          <TodayList />
        </Suspense>
        <div className="space-y-4">
          <Suspense fallback={<Skeleton className="h-72 w-full rounded-xl" />}>
            <NumbersCard />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-60 w-full rounded-xl" />}>
            <SeoSummaryCard />
          </Suspense>
        </div>
      </div>

      <DashboardTabs
        tabs={[
          { key: "articles", label: "المقالات", count: c(articleTotal), panel: panel(<ArticlesPipeline />) },
          { key: "clients", label: "العملاء", count: c(clients.total), panel: panel(<ClientsPipeline />, "h-96") },
          { key: "visitors", label: "الزوار", count: c(va.bookings.db), panel: panel(<VisitorActionsBreakdown />) },
          {
            key: "members",
            label: "الأعضاء والنشرة",
            count: c(members.total),
            panel: (
              <div className="space-y-6">
                {panel(<MembersPipeline />, "h-40")}
                {panel(<SubscribersPipeline />, "h-40")}
                {panel(<NewsletterPipeline />, "h-40")}
              </div>
            ),
          },
          { key: "pages", label: "صفحات الموقع", count: c(listing.length + content.length + sectors.length), panel: panel(<ListingPagesSeo />) },
          {
            key: "media",
            label: "الوسائط والتصنيفات",
            panel: (
              <div className="space-y-6">
                {panel(<MediaLibrary />, "h-40")}
                {panel(<ReferenceData />, "h-40")}
              </div>
            ),
          },
          { key: "errors", label: "أخطاء البيانات", count: c(errorTotal), panel: panel(<ErrorsToFix />, "h-24") },
        ]}
      />
    </div>
  );
}
