import type { Metadata } from "next";
import { CONTACT_BLOCKS } from "@modonty/shared/components/partner-site/free/contact";
import { PageBlocks } from "../../components/page-blocks";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPartnerSite } from "../../helpers/get-partner-site";
import { getClientPageData } from "../../helpers/client-page-data";
import { buildPartnerPageMetadata } from "../../helpers/build-partner-page-metadata";
import { PageFrame } from "../../components/page-frame";
import { ContactBlock } from "../../components/home/contact-block";
import { BookingCard, BookingCardSkeleton } from "../../components/home/booking-card";
import { ClientContactSection } from "../../components/sections/client-contact-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPartnerSite(decodeURIComponent(slug));
  if (!site) return { title: "غير موجود" };
  return buildPartnerPageMetadata({
    slug,
    sub: "contact",
    title: `تواصل مع ${site.name}`.slice(0, 51),
    description: `عنوان ${site.name}${site.addressCity ? ` في ${site.addressCity}` : ""}، ساعات العمل، الهاتف والواتساب — واطلب اتصالاً.`,
    heroImage: site.heroImageMedia,
    logo: site.logoMedia,
  });
}

/** «تواصل» — address · hours · phone · map (when he has coordinates) · the request card. */

/** Rendered from the shared block registry — same components the partner previewed in the console. */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <PageBlocks slug={slug} blocks={CONTACT_BLOCKS} titlePrefix="تواصل مع" />;
}
