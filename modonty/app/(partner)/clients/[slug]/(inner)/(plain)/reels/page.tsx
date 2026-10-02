import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { REELS_BLOCKS } from "@modonty/shared/components/partner-site/free/reels";
import { PageBlocks } from "../../../components/page-blocks";
import { getClientPageData } from "../../../helpers/client-page-data";
import { getCachedHomeData } from "../../../helpers/get-cached-home-data";
import { buildPartnerPageMetadata } from "../../../helpers/build-partner-page-metadata";

interface ClientReelsPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * «ريلز {الشريك}» — every published reel, each a real link to its watch page (plan item د١,
 * 2 Oct 2026). It used to list the partner's ARTICLES under a «ريل» badge, was `noindex,
 * nofollow`, and no page linked to it — while 11 of 23 reels had no inbound link at all.
 * Indexable and followed now: it is the one page that links every reel of this partner.
 */
export async function generateMetadata({ params }: ClientReelsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [data, home] = await Promise.all([getClientPageData(slug), getCachedHomeData(decodeURIComponent(slug))]);
  if (!data || !home) return { title: "غير موجود" };
  const count = home.data.reels.length;
  const meta = await buildPartnerPageMetadata({
    slug,
    sub: "reels",
    title: `ريلز ${data.client.name}`.slice(0, 51),
    description: `${count} ريل من ${data.client.name} على مدونتي — فيديوهات قصيرة تشوفها في دقيقة.`,
    heroImage: data.client.heroImageMedia,
    logo: data.client.logoMedia,
  });
  // A partner with no reel has nothing here to index.
  return count === 0 ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default async function ClientReelsPage({ params }: ClientReelsPageProps) {
  const { slug } = await params;
  const home = await getCachedHomeData(decodeURIComponent(slug));
  if (!home) notFound();
  if (home.data.reels.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">ما فيه ريلز منشورة لـ{home.data.name} بعد.</p>;
  }
  return <PageBlocks slug={slug} blocks={REELS_BLOCKS} titlePrefix="ريلز" />;
}
