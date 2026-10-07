import type { Metadata } from "next";
import { PageBlocks } from "../../components/page-blocks";
import { getClientPageData } from "../../helpers/get-client-page-data";
import { buildPartnerPageMetadata } from "../../helpers/build-partner-page-metadata";
import { messages } from "@/lib/i18n/messages";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getClientPageData(slug);
  if (!data) return { title: "غير موجود" };
  return buildPartnerPageMetadata({
    slug,
    sub: "articles",
    title: `مقالات ${data.client.name}`.slice(0, 51),
    description: messages.seo.partner.articlesDescription
      .replace("{name}", data.client.name)
      .replace("{count}", String(data.client._count.articles)),
    heroImage: data.client.heroImageMedia,
    logo: data.client.logoMedia,
  });
}

/** «مقالاته» — every published article by this partner, newest first. */

/** Rendered from the shared block registry — same components the partner previewed in the console. */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <PageBlocks slug={slug} page="articles" />;
}
