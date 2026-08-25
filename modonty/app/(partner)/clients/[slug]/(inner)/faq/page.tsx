import type { Metadata } from "next";
import { FAQ_BLOCKS } from "@modonty/shared/components/partner-site/free/faq";
import { PageBlocks } from "../../components/page-blocks";
import { notFound } from "next/navigation";
import { jsonLdHtml } from "@/lib/seo";
import { getPartnerSite } from "../../helpers/get-partner-site";
import { getClientPageFaqs } from "../../helpers/client-faqs";
import { buildPartnerPageMetadata } from "../../helpers/build-partner-page-metadata";
import { PageFrame } from "../../components/page-frame";
import { ClientFaqSection } from "../../components/sections/client-faq-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPartnerSite(decodeURIComponent(slug));
  if (!site) return { title: "غير موجود" };
  return buildPartnerPageMetadata({
    slug,
    sub: "faq",
    title: `أسئلة شائعة — ${site.name}`.slice(0, 51),
    description: `أجوبة ${site.name} على أكثر ما يُسأل عنه قبل الحجز.`,
    heroImage: site.heroImageMedia,
    logo: site.logoMedia,
  });
}

/** «الأسئلة» — the partner's published FAQ + the ask-a-question form (FAQPage JSON-LD ships too). */

/** Rendered from the shared block registry — same components the partner previewed in the console. */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <PageBlocks slug={slug} blocks={FAQ_BLOCKS} titlePrefix="الأسئلة الشائعة لدى" />;
}
