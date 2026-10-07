import type { Metadata } from "next";
import { PageBlocks } from "../../components/page-blocks";
import { getPartnerSite } from "../../helpers/get-partner-site";
import { buildPartnerPageMetadata } from "../../helpers/build-partner-page-metadata";

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
  return <PageBlocks slug={slug} page="contact" />;
}
