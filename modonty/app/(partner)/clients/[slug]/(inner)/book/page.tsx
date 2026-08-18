import type { Metadata } from "next";
import { BOOKING_BLOCKS } from "@modonty/shared/components/partner-site/free/booking";
import { PageBlocks } from "../../components/page-blocks";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "احجز الآن",
  robots: { index: false, follow: false },
};

/** «الحجز» — the admin's request form (or link) from the shared registry; the whole page is empty when no button is set. */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <PageBlocks slug={slug} blocks={BOOKING_BLOCKS} />;
}
