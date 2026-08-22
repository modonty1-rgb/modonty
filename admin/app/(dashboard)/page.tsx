import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { getDashboardAlerts } from "./actions/dashboard-actions";
import { DashboardAlertsBanner } from "./components/dashboard-alerts-banner";
import { DashboardNav } from "./components/dashboard-nav";
import { PlatformSeoOverall } from "./components/sections/platform-seo-overall";
import { TodayStrip } from "./components/sections/today-strip";
import { VisitorActionsBreakdown } from "./components/sections/visitor-actions-breakdown";
import { ArticlesPipeline } from "./components/sections/articles-pipeline";
import { ClientsPipeline } from "./components/sections/clients-pipeline";
import { MembersPipeline } from "./components/sections/members-pipeline";
import { SubscribersPipeline } from "./components/sections/subscribers-pipeline";
import { NewsletterPipeline } from "./components/sections/newsletter-pipeline";
import { ErrorsToFix } from "./components/sections/errors-to-fix";
import { ListingPagesSeo } from "./components/sections/listing-pages-seo";
import { MediaLibrary } from "./components/sections/media-library";
import { ReferenceData } from "./components/sections/reference-data";

/**
 * The dashboard is a TRIAGE screen, and the Today strip is its answer
 * (design approved 2026-07-13).
 *
 * Reading order = business order: what needs me now (Today) → what visitors did →
 * our content → the money → the housekeeping (media + reference share one row).
 * Every number the strip ranks comes from the same cached fetch its section uses,
 * so the two can never disagree.
 */
export default async function DashboardPage() {
  const alerts = await getDashboardAlerts();

  return (
    <div className="mx-auto max-w-[1280px] space-y-7">
      {/* Sticky jump-bar — the topmost pinned element, sits right under the main header
          (Khalid 2026-07-25: «اللاصق الأكبر فوق وتحت الهيدر الرئيسي») */}
      <DashboardNav />

      {/* 0 · The one platform number — Modonty's overall SEO */}
      <Suspense fallback={<Skeleton className="h-20 w-full rounded-2xl" />}>
        <PlatformSeoOverall />
      </Suspense>

      {/* 1 · The ranked answer to "what needs you today" (includes the page header) */}
      <section id="sec-today" className="scroll-mt-24">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-14 w-72" />
              <Skeleton className="h-64 w-full" />
            </div>
          }
        >
          <TodayStrip />
        </Suspense>
      </section>

      {/* Urgent cross-source alerts — renders nothing when all is clear */}
      <DashboardAlertsBanner alerts={alerts} />

      {/* The seven modonty listing pages — meta + JSON-LD + their link to Settings.
          Sits right under the platform number because it explains it: these are the
          pages Google lands on, and nothing measured them before today. */}
      <section id="sec-listing-seo" className="scroll-mt-24">
        <Suspense fallback={<Skeleton className="h-24 w-full" />}>
          <ListingPagesSeo />
        </Suspense>
      </section>

      {/* Data problems needing a human — reusable «Errors to fix» aggregator */}
      <section id="sec-errors-to-fix" className="scroll-mt-24">
        <Suspense fallback={<Skeleton className="h-24 w-full" />}>
          <ErrorsToFix />
        </Suspense>
      </section>

      {/* 2 · What visitors did to us */}
      <section id="sec-visitors" className="scroll-mt-24">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <VisitorActionsBreakdown />
        </Suspense>
      </section>

      {/* 3 · Where our own content stands */}
      <section id="sec-articles" className="scroll-mt-24">
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <ArticlesPipeline />
        </Suspense>
      </section>

      {/* 4 · Where the money stands */}
      <section id="sec-clients" className="scroll-mt-24">
        <Suspense fallback={<Skeleton className="h-72 w-full" />}>
          <ClientsPipeline />
        </Suspense>
      </section>

      {/* 5 · The people who registered on Modonty (Google / email + password) */}
      <section id="sec-members" className="scroll-mt-24">
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <MembersPipeline />
        </Suspense>
      </section>

      {/* 6 · Subscribers — per-client audience + Modonty's own newsletter (distinct sources) */}
      <section id="sec-subscribers" className="scroll-mt-24">
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <SubscribersPipeline />
        </Suspense>
      </section>

      <section id="sec-newsletter" className="scroll-mt-24">
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <NewsletterPipeline />
        </Suspense>
      </section>

      {/* 7 · Housekeeping — each on its own full-width row (collapsed header = one line) */}
      <section id="sec-media" className="scroll-mt-24">
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <MediaLibrary />
        </Suspense>
      </section>
      <section id="sec-reference" className="scroll-mt-24">
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <ReferenceData />
        </Suspense>
      </section>
    </div>
  );
}
