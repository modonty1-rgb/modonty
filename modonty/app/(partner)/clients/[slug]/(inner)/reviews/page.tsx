import type { Metadata } from "next";
import { REVIEWS_BLOCKS } from "@modonty/shared/components/partner-site/free/testimonials";
import { PageBlocks } from "../../components/page-blocks";
import { notFound } from "next/navigation";
import { getClientPageData } from "../../helpers/client-page-data";
import { buildPartnerPageMetadata } from "../../helpers/build-partner-page-metadata";
import { getClientReviewsBySlug } from "../../helpers/client-reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { IconMessage } from "@/lib/icons";

interface ClientReviewsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ClientReviewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getClientPageData(slug);
  if (!data) return { title: "غير موجود" };
  return buildPartnerPageMetadata({
    slug,
    sub: "reviews",
    title: `تقييمات ${data.client.name}`.slice(0, 51),
    description: `آراء وتقييمات المستخدمين على محتوى ${data.client.name}`,
    heroImage: data.client.heroImageMedia,
    logo: data.client.logoMedia,
  });
}


/** Rendered from the shared block registry — same components the partner previewed in the console. */
export default async function Page({ params }: ClientReviewsPageProps) {
  const { slug } = await params;
  return <PageBlocks slug={slug} blocks={REVIEWS_BLOCKS} titlePrefix="تقييمات" />;
}
