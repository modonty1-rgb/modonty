import type { Metadata } from "next";
import { ABOUT_BLOCKS } from "@modonty/shared/components/partner-site/free/about";
import { PageBlocks } from "../../components/page-blocks";
import { notFound } from "next/navigation";
import { getClientPageData } from "../../helpers/client-page-data";
import { buildPartnerPageMetadata } from "../../helpers/build-partner-page-metadata";
import { PageFrame } from "../../components/page-frame";
import { ClientAboutSection } from "../../components/sections/client-about-section";
import { ClientTeamSection } from "../../components/sections/client-team-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getClientPageData(slug);
  if (!data) return { title: "غير موجود" };
  return buildPartnerPageMetadata({
    slug,
    sub: "about",
    title: `من هو ${data.client.name}`.slice(0, 51),
    description: data.client.seoDescription || `تعرّف على ${data.client.name}: قصّته، فريقه، واعتماداته`,
    heroImage: data.client.heroImageMedia,
    logo: data.client.logoMedia,
  });
}

/** «من هو» — the full story: description + video, credentials, legal facts, and the team. */

/** Rendered from the shared block registry — same components the partner previewed in the console. */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <PageBlocks slug={slug} blocks={ABOUT_BLOCKS} />;
}
