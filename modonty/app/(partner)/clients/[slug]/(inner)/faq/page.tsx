import type { Metadata } from "next";
import { Section } from "@modonty/shared/components/partner-site/free/home/parts/section";
import { PageBlocks } from "../../components/page-blocks";
import { jsonLdHtml } from "@/lib/seo";
import { getPartnerSite } from "../../helpers/get-partner-site";
import { getCachedHomeData } from "../../helpers/get-cached-home-data";
import { buildPartnerPageMetadata } from "../../helpers/build-partner-page-metadata";
import { ClientFaqQuestionForm } from "../../components/sections/client-faq-question-form";

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

/**
 * «الأسئلة» — the partner's questions from the shared registry, then the ask-a-question form,
 * with an FAQPage JSON-LD for exactly the questions on the page.
 *
 * The template rebuild dropped both (4 Oct 2026): visitors could no longer ask, and the page that
 * the home page's own comment calls «the complete set is declared on /faq» declared nothing.
 * The JSON-LD reads the same list the accordion renders (`home.data.faqs`), so Google is never
 * promised a question that is not visible.
 */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const home = await getCachedHomeData(decodeURIComponent(slug));
  const faqs = home?.data.faqs ?? [];
  return (
    <>
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdHtml({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
            }),
          }}
        />
      )}
      <PageBlocks
        slug={slug}
        page="faq"
        after={{
          faq: (
            <Section id="ask" eyebrow="لم تجد سؤالك؟" heading="اطرح سؤالك">
              <div className="mx-auto max-w-3xl">
                <ClientFaqQuestionForm slug={decodeURIComponent(slug)} />
              </div>
            </Section>
          ),
        }}
      />
    </>
  );
}
