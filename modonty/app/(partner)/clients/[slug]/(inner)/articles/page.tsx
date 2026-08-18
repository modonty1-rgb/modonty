import type { Metadata } from "next";
import { BLOG_BLOCKS } from "@modonty/shared/components/partner-site/free/blog";
import { PageBlocks } from "../../components/page-blocks";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OptimizedImage } from "@modonty/shared/components/optimized-image";
import { getClientPageData } from "../../helpers/client-page-data";
import { PageFrame } from "../../components/page-frame";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const DATE_FMT = new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "long", year: "numeric" });

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getClientPageData(slug);
  if (!data) return { title: "غير موجود" };
  return {
    title: `مقالات ${data.client.name}`.slice(0, 51),
    description: `كل ما كتبه ${data.client.name} على مدونتي — ${data.client._count.articles} مقالاً`,
  };
}

/** «مقالاته» — every published article by this partner, newest first. */

/** Rendered from the shared block registry — same components the partner previewed in the console. */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <PageBlocks slug={slug} blocks={BLOG_BLOCKS} />;
}
