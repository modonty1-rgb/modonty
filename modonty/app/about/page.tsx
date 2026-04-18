import { Metadata } from "next";
import { Suspense } from "react";
import NextImage from "next/image";
import Link from "@/components/link";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { generateStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { getAboutPageForMetadata } from "./helpers/about-metadata";
import { getAboutPageContent } from "./helpers/about-content";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getAboutPageForMetadata();

    if (!page) {
      return {
        title: "من نحن - مودونتي",
        description: "تعرف على منصة مودونتي - منصة المدونات الاحترافية متعددة العملاء",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
    const siteName = page.ogSiteName || "مودونتي";
    const title = page.seoTitle || page.title || "من نحن";
    const description = page.seoDescription || "تعرف على منصة مودونتي";
    const canonicalUrl = page.canonicalUrl || `${siteUrl}/about`;
    const ogImage = page.ogImage || page.socialImage || `${siteUrl}/og-image.jpg`;
    const locale = page.ogLocale || page.inLanguage || "ar_SA";

    const robotsDirective = page.metaRobots || "index,follow";
    const shouldIndex = !robotsDirective.includes("noindex");
    const shouldFollow = !robotsDirective.includes("nofollow");

    const openGraph: Metadata["openGraph"] = {
      title,
      description,
      url: canonicalUrl,
      siteName: siteName,
      images: [{ url: ogImage, width: 1200, height: 630, alt: page.socialImageAlt || title }],
      locale: locale,
      type: (page.ogType as "website" | "article" | "profile") || "website",
    };

    const twitter: NonNullable<Metadata["twitter"]> = {
      card: (page.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title,
      description,
      images: [ogImage],
    };

    const twitterSite = page.twitterSite || process.env.NEXT_PUBLIC_TWITTER_SITE;
    const twitterCreator = page.twitterCreator || process.env.NEXT_PUBLIC_TWITTER_CREATOR;
    if (twitterSite) twitter.site = twitterSite.startsWith("@") ? twitterSite : `@${twitterSite}`;
    if (twitterCreator) twitter.creator = `@${twitterCreator.replace(/^@/, "")}`;

    return {
      title: `${title} - ${siteName}`,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph,
      twitter,
      robots: {
        index: shouldIndex,
        follow: shouldFollow,
        googleBot: { index: shouldIndex, follow: shouldFollow, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
      },
    };
  } catch {
    return {
      title: "من نحن - مودونتي",
      description: "تعرف على منصة مودونتي - منصة المدونات الاحترافية متعددة العملاء",
    };
  }
}

function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

function AboutFallback() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
      <div className="h-64 bg-muted animate-pulse rounded mb-6" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

async function AboutContent() {
  let page;
  let hasContent = false;

  try {
    page = await getAboutPageContent();
    if (page && page.content) {
      hasContent = true;
    }
  } catch (error) {
    console.error("Error fetching about page:", error);
  }

  // Fallback content
  const fallbackTitle = "من نحن";
  const fallbackContent = `
    <p>
      مودونتي هي منصة مدونات احترافية متعددة العملاء تهدف إلى توفير حل شامل لإدارة
      المحتوى وإنشاء المدونات للشركات والمؤسسات.
    </p>
    <h2>رؤيتنا</h2>
    <p>
      نطمح إلى أن نكون المنصة الرائدة في المنطقة العربية لإدارة المحتوى والمدونات،
      حيث يمكن للشركات والمؤسسات إنشاء وإدارة محتواها بسهولة واحترافية.
    </p>
    <h2>مهمتنا</h2>
    <p>
      مهمتنا هي توفير أدوات قوية وسهلة الاستخدام تمكن العملاء من إنشاء محتوى عالي
      الجودة وإدارته بكفاءة، مع الحفاظ على المرونة والتخصيص.
    </p>
    <h2>ما نقدمه</h2>
    <ul>
      <li>منصة متعددة العملاء لإدارة المحتوى</li>
      <li>أدوات تحرير متقدمة للمقالات</li>
      <li>إدارة الفئات والوسوم</li>
      <li>تحليلات وأدوات SEO</li>
      <li>واجهة مستخدم عصرية وسهلة الاستخدام</li>
    </ul>
  `;

  const pageTitle = page?.title || fallbackTitle;
  const pageContent = hasContent ? page!.content : fallbackContent;
  const heroImage = page?.heroImage;
  const heroImageAlt = page?.heroImageAlt || pageTitle;

  const structuredData = generateStructuredData({
    type: "AboutPage",
    name: `${pageTitle} - مودونتي`,
    description: "تعرف على منصة مودونتي",
    url: "/about",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(structuredData) }}
      />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: pageTitle },
          ]}
        />
        {heroImage && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
            <NextImage
              src={heroImage}
              alt={heroImageAlt || "من نحن - مودونتي"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>
        )}
        <div className="prose prose-sm max-w-none prose-h2:text-foreground prose-h2:font-bold prose-h2:border-t prose-h2:border-border prose-h2:pt-6 prose-h2:mt-8 prose-h3:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
          <h1 className="text-3xl font-bold mb-6">{pageTitle}</h1>
          <div dangerouslySetInnerHTML={{ __html: pageContent }} />
        </div>

        {/* B2B section — JBRSEO-7 */}
        <div className="mt-12 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-primary/20 p-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">للشركات والأعمال</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            هل تريد عملاء من جوجل بدون إعلانات؟ مودونتي تُنشئ لك محتوى SEO احترافياً يظهر في أعلى نتائج البحث ويجذب عملاء حقيقيين.
          </p>
          <ul className="space-y-3 mb-8 text-sm text-muted-foreground">
            {[
              "محتوى مُحسَّن لمحركات البحث يبني سلطتك الرقمية",
              "مقالات تستهدف كلماتك المفتاحية وتجلب زيارات عضوية مستمرة",
              "نتائج قابلة للقياس — ترتيب أعلى، ثقة أكثر، مبيعات أكبر",
            ].map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <CtaTrackedLink
            href="https://www.jbrseo.com"
            target="_blank"
            rel="noopener noreferrer"
            label="About Page B2B CTA — ابدأ مع جبر SEO"
            type="BUTTON"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            ابدأ مع جبر SEO ↗
          </CtaTrackedLink>
        </div>
      </div>
    </>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={<AboutFallback />}>
      <AboutContent />
    </Suspense>
  );
}
