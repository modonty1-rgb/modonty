import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jsonLdHtml } from "@/lib/seo";
import { getPartnerSite } from "../../helpers/get-partner-site";
import { getClientPageFaqs } from "../../helpers/client-faqs";
import { PageFrame } from "../../components/page-frame";
import { ClientFaqSection } from "../../components/sections/client-faq-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPartnerSite(decodeURIComponent(slug));
  if (!site) return { title: "غير موجود" };
  return {
    title: `أسئلة شائعة — ${site.name}`.slice(0, 51),
    description: `أجوبة ${site.name} على أكثر ما يُسأل عنه قبل الحجز.`,
  };
}

/** «الأسئلة» — the partner's published FAQ + the ask-a-question form (FAQPage JSON-LD ships too). */
export default async function ClientFaqPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const [site, faqs] = await Promise.all([getPartnerSite(decodedSlug), getClientPageFaqs(decodedSlug)]);
  if (!site) notFound();

  return (
    <PageFrame siteName={site.name} base={`/clients/${encodeURIComponent(site.slug)}`} eyebrow="يسألونه كثيراً" title="أسئلة قبل ما تحجز">
      {faqs.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdHtml({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
            }),
          }}
        />
      ) : null}
      <ClientFaqSection faqs={faqs} slug={site.slug} />
    </PageFrame>
  );
}
