import type { Metadata } from "next";
import { PageBlocks } from "../../components/page-blocks";
import { notFound } from "next/navigation";
import { getClientPageData } from "../../helpers/client-page-data";
import { buildPartnerPageMetadata } from "../../helpers/build-partner-page-metadata";
import { getClientReviewsBySlug } from "../../helpers/client-reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { IconMessage } from "@/lib/icons";
import { auth } from "@/lib/auth";
import { ClientReviewForm } from "../../components/sections/client-review-form";

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
  const session = await auth();
  // The partner's review blocks show what readers wrote, but nothing let a reader write one —
  // the form existed unmounted (subscriber QA finding #9, 29 Sep 2026).
  return (
    <>
      <PageBlocks slug={slug} page="reviews" />
      <section className="mx-auto max-w-[1216px] px-4 pb-12" aria-label="اكتب تقييمك">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-lg font-bold">جرّبت خدماتهم؟</h2>
          <p className="mt-1 text-sm text-muted-foreground">تقييمك يساعد غيرك يختار — ويظهر بعد مراجعة الشريك.</p>
          <ClientReviewForm slug={decodeURIComponent(slug)} isLoggedIn={Boolean(session?.user)} />
        </div>
      </section>
    </>
  );
}
