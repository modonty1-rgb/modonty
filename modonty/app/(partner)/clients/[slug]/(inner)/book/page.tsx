import type { Metadata } from "next";
import { PageBlocks } from "../../components/page-blocks";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "احجز الآن",
  robots: { index: false, follow: false },
};

/** «الحجز» — the admin's request form (or link) from the shared registry; the whole page is empty when no button is set. */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  // h1 كبقيّة الصفحات الداخلية (٤ أكتوبر ٢٠٢٦): كانت الصفحة الوحيدة بلا عنوان رئيسي — قسمُ الحجز h2.
  return <PageBlocks slug={slug} page="book" />;
}
