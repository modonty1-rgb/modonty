import { notFound, redirect } from "next/navigation";
import { CachedHomePage } from "@/app/(homepage)/components/page-layout/CachedHomePage";
import { UserCard } from "@/app/(homepage)/components/user-card/UserCard";
import { SITE_URL } from "@/constants";

import type { Metadata } from "next";

// The crawlable half of the homepage's infinite scroll. Google's requirement
// (developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading):
// "Give each chunk its own persistent, unique URL … Link sequentially to the
// individual URLs so that search engines can discover the URLs in a paginated set."
// `/` is chunk 1 and stays untouched; this route serves chunk 2 onwards — as the
// SAME homepage with the feed starting at chunk n, so a reader who refreshes
// mid-scroll lands on the page they were reading, not on a bare archive.

interface PageProps {
  params: Promise<{ pageNumber: string }>;
}

function parsePageNumber(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 1 ? value : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pageNumber } = await params;
  const page = parsePageNumber(pageNumber);
  if (!page || page < 2) return {};

  const pageArabic = page.toLocaleString("ar-SA");
  return {
    title: `آخر المقالات — الصفحة ${pageArabic}`,
    description: `الصفحة ${pageArabic} من آخر مقالات مدونتي — محتوى عربي موثوق من شركاء معتمدين.`,
    // Self-referencing on purpose: Google treats paginated URLs as separate pages
    // and warns against pointing the whole series at page 1.
    alternates: { canonical: `${SITE_URL}/page/${page}` },
  };
}

// On a reload the browser restores the old scroll offset (clamped to this shorter
// document) — that is left alone: an inline `history.scrollRestoration = "manual"` here
// was measured to run after Chrome had already restored, so it bought nothing. What
// matters is that the scroller does not fetch chunk n+1 from a restored viewport before
// the visitor moves — useMountOnApproach enforces that.
export default async function FeedPage({ params }: PageProps) {
  const { pageNumber } = await params;
  const page = parsePageNumber(pageNumber);

  if (!page) notFound();
  // Chunk 1 lives at `/` — a second URL for it would split the series' signals.
  if (page === 1) redirect("/");

  return <CachedHomePage page={page} userCard={<UserCard />} />;
}
