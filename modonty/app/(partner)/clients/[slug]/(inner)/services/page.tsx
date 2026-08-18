import type { Metadata } from "next";
import { SERVICES_BLOCKS } from "@modonty/shared/components/partner-site/free/services";
import { PageBlocks } from "../../components/page-blocks";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconBriefcase } from "@/lib/icons";
import { getPartnerSite } from "../../helpers/get-partner-site";
import { PageFrame } from "../../components/page-frame";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPartnerSite(decodeURIComponent(slug));
  if (!site) return { title: "غير موجود" };
  return {
    title: `خدمات ${site.name}`.slice(0, 51),
    description: `كل خدمات ${site.name}${site.addressCity ? ` في ${site.addressCity}` : ""} — واطلب اتصالاً مباشرة.`,
  };
}

/** «خدماته» — every service as a card; each one points at the request card on the home page. */

/** Rendered from the shared block registry — same components the partner previewed in the console. */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <PageBlocks slug={slug} blocks={SERVICES_BLOCKS} />;
}
