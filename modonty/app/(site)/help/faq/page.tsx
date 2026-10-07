import type { Metadata } from "next";
import Link from "next/link";
import { jsonLdHtml, jsonLdHtmlFromString } from "@/lib/seo";
import { generateFAQPageStructuredData } from "./helpers/generate-faq-page-structured-data";
import { buildFaqFallbackMetadata } from "./helpers/build-faq-fallback-metadata";
import { getFaqLastUpdated } from "./helpers/get-faq-last-updated";
import { getListingPageSeo } from "@/lib/seo/get-listing-page-seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getActiveFAQs } from "./actions";
import { IconArrowRight, IconEmail, IconHelpCircle } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import { FAQPageContent } from "./components/faq-page-content";

const text = messages.faq;

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getListingPageSeo("faq");

  // الشرط كان `if (metadata)` — والبلوب المخزَّن موجودٌ **بلا مفتاح `title`** (مقيس على
  // القاعدة: عمود `faqPageMetaTags` بلا `title`). فالكائن صادق، والاحتياط لا يُستدعى أبداً،
  // و«title.template has no effect if a route has not defined a title or title.default»
  // (generate-metadata.md:294) ⇒ تُورَث `default` الجذر. النتيجة على الإنتاج ١ سبتمبر ٢٠٢٦:
  // «مدونتي - منصة المدونات متعددة الشركاء» — عنوان الموقع لا عنوان الصفحة.
  // الشرط الصحيح: بلوبٌ بلا عنوان = لا بلوب.
  if (!metadata || typeof metadata.title === "undefined") return buildFaqFallbackMetadata();

  // ومتى وُجد العنوان، يُلفّ كما في بقيّة صفحات القوائم كي لا يُلحق القالب العلامة ثانيةً.
  if (typeof metadata.title === "string") {
    return { ...metadata, title: { absolute: metadata.title } };
  }
  return metadata;
}

export default async function FAQPage() {
  const [faqs, seo] = await Promise.all([getActiveFAQs(), getListingPageSeo("faq")]);

  // Use cached JSON-LD from Settings (escaped — stored blobs are bare-stringified).
  const buildFallbackJsonLd = () => jsonLdHtml(generateFAQPageStructuredData(faqs));
  const jsonLdString = seo.jsonLd ? jsonLdHtmlFromString(seo.jsonLd) : buildFallbackJsonLd();

  const lastUpdated = getFaqLastUpdated(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: text.helpBreadcrumbLabel, href: "/help" },
            { label: text.breadcrumbLabel },
          ]}
        />

        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-2">{text.title}</h1>
          <p className="text-muted-foreground">{text.intro}</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button asChild variant="outline" size="sm" className="max-md:h-11">
            <Link href="/help">
              <IconArrowRight className="h-4 w-4 ml-2" />
              {text.backToHelp}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="max-md:h-11">
            <Link href="/contact">
              <IconEmail className="h-4 w-4 ml-2" />
              {text.contactUs}
            </Link>
          </Button>
        </div>

        {faqs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <IconHelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{text.empty.title}</h3>
              <p className="text-muted-foreground mb-6">{text.empty.description}</p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="default" className="max-md:h-11">
                  <Link href="/contact">{text.empty.contact}</Link>
                </Button>
                <Button asChild variant="outline" className="max-md:h-11">
                  <Link href="/help/feedback">{text.empty.feedback}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <FAQPageContent 
            faqs={faqs} 
            lastUpdated={lastUpdated}
          />
        )}
      </div>
    </>
  );
}
