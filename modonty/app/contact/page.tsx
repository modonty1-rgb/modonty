import { Metadata } from "next";
import { generateStructuredData, buildAlternates } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ContactForm } from "./components/contact-form";
import { auth } from "@/lib/auth";
import { getContactPageForMetadata } from "./helpers/contact-metadata";
import { getContactPageContent } from "./helpers/contact-content";
import { BRAND_AR, SITE_URL } from "@/constants";
import { getBrandMedia } from "@/lib/settings/get-brand-media";

const FALLBACK_TITLE = "اتصل بنا";
const FALLBACK_DESCRIPTION = "تواصل مع فريق مدونتي. نحن هنا للإجابة على أسئلتك ومساعدتك";

// Contact holds the phone, email and address a visitor acts on — the details most likely
// to change. It was the last modonty page whose copy needed a deploy to edit; now it reads
// its row from the DB like /about and the legal pages, and falls back to these constants
// only while the row is still empty.
export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getContactPageForMetadata();

    if (!page) {
      return { title: `${FALLBACK_TITLE} - ${BRAND_AR}`, description: FALLBACK_DESCRIPTION };
    }

    const siteUrl = SITE_URL;
    const siteName = page.ogSiteName || BRAND_AR;
    const title = page.seoTitle || page.title || FALLBACK_TITLE;
    const description = page.seoDescription || FALLBACK_DESCRIPTION;
    const canonicalUrl = page.canonicalUrl || `${siteUrl}/contact`;
    const brandMedia = await getBrandMedia();
    const ogImage = page.ogImage || page.socialImage || brandMedia.ogImageUrl || undefined;
    const locale = page.ogLocale || page.inLanguage || "ar_SA";

    const robotsDirective = page.metaRobots || "index,follow";
    const shouldIndex = !robotsDirective.includes("noindex");
    const shouldFollow = !robotsDirective.includes("nofollow");

    const openGraph: Metadata["openGraph"] = {
      title,
      description,
      url: canonicalUrl,
      siteName,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: page.socialImageAlt || title }]
        : undefined,
      locale,
      type: (page.ogType as "website" | "article" | "profile") || "website",
    };

    const twitter: NonNullable<Metadata["twitter"]> = {
      card: (page.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    };

    const twitterSite = page.twitterSite || brandMedia.twitterSite;
    const twitterCreator = page.twitterCreator || brandMedia.twitterCreator;
    if (twitterSite) {
      twitter.site = twitterSite.startsWith("@") ? twitterSite : `@${twitterSite}`;
    }
    if (twitterCreator) {
      twitter.creator = `@${twitterCreator.replace(/^@/, "")}`;
    }

    return {
      // The root layout's template already appends the brand (layout.tsx:35).
      title,
      description,
      alternates: buildAlternates(canonicalUrl),
      openGraph,
      twitter,
      robots: {
        index: shouldIndex,
        follow: shouldFollow,
        googleBot: {
          index: shouldIndex,
          follow: shouldFollow,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata for contact page:", error);
    return { title: `${FALLBACK_TITLE} - ${BRAND_AR}`, description: FALLBACK_DESCRIPTION };
  }
}

function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

export default async function ContactPage() {
  const [session, page] = await Promise.all([auth(), getContactPageContent()]);
  const defaultName = session?.user?.name ?? null;
  const defaultEmail = session?.user?.email ?? null;

  const pageTitle = page?.title?.trim() || FALLBACK_TITLE;
  const intro = page?.content?.trim();

  // Prefer the stored, admin-validated card; build live ONLY when it is absent.
  const storedJsonLd = page?.jsonLdStructuredData?.trim();
  const buildFallbackStructuredData = () =>
    generateStructuredData({
      type: "ContactPage",
      name: `${pageTitle} - ${BRAND_AR}`,
      description: FALLBACK_DESCRIPTION,
      url: "/contact",
    });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: storedJsonLd ?? sanitizeJsonLd(buildFallbackStructuredData()),
        }}
      />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: pageTitle },
          ]}
        />
        <h1 className="text-3xl font-bold mb-6">{pageTitle}</h1>
        {intro ? (
          <div
            className="prose prose-neutral dark:prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: intro }}
          />
        ) : (
          <p className="text-muted-foreground mb-8">
            نرحب بأسئلتك وملاحظاتك. يرجى ملء النموذج أدناه وسنقوم بالرد عليك في أقرب وقت ممكن.
          </p>
        )}
        <ContactForm defaultName={defaultName} defaultEmail={defaultEmail} />
      </div>
    </>
  );
}
