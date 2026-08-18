import type { Metadata } from "next";
import { GALLERY_BLOCKS } from "@modonty/shared/components/partner-site/free/gallery";
import { PageBlocks } from "../../components/page-blocks";
import { notFound } from "next/navigation";
import { getClientPageData } from "../../helpers/client-page-data";
import { ClientPhotosPreview } from "../../components/client-photos-preview";

interface ClientPhotosPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ClientPhotosPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getClientPageData(slug);
  if (!data) return { title: "غير موجود" };
  return {
    title: `صور ${data.client.name}`.slice(0, 51),
    description: `معرض صور ومحتوى مرئي لـ ${data.client.name}`,
  };
}


/** Rendered from the shared block registry — same components the partner previewed in the console. */
export default async function Page({ params }: ClientPhotosPageProps) {
  const { slug } = await params;
  return <PageBlocks slug={slug} blocks={GALLERY_BLOCKS} />;
}
