import { Metadata } from "next";
import { Suspense } from "react";
import { generateStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { FormattedDate } from "@/components/date/FormattedDate";
import { getCopyrightPolicyPageForMetadata } from "./helpers/copyright-policy-metadata";
import { getCopyrightPolicyPageContent } from "./helpers/copyright-policy-content";
import { BRAND_AR, SITE_URL } from "@/lib/brand";
import { getBrandMedia } from "@/lib/settings/get-brand-media";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getCopyrightPolicyPageForMetadata();

    if (!page) {
      // Fallback to default metadata
      return {
        title: "سياسة حقوق النشر - مدونتي",
        description: "سياسة حقوق النشر والملكية الفكرية لمنصة مدونتي",
      };
    }

    const siteUrl = SITE_URL;
    const siteName = page.ogSiteName || BRAND_AR;
    const title = page.seoTitle || page.title || "سياسة حقوق النشر";
    const description = page.seoDescription || "سياسة حقوق النشر والملكية الفكرية لمنصة مدونتي";
    const canonicalUrl = page.canonicalUrl || `${siteUrl}/legal/copyright-policy`;
    const brandMedia = await getBrandMedia();
    const ogImage = page.ogImage || page.socialImage || brandMedia.ogImageUrl || undefined;
    const locale = page.ogLocale || page.inLanguage || "ar_SA";

    // Parse robots directive
    const robotsDirective = page.metaRobots || "index,follow";
    const shouldIndex = !robotsDirective.includes("noindex");
    const shouldFollow = !robotsDirective.includes("nofollow");

    const openGraph: Metadata["openGraph"] = {
      title,
      description,
      url: canonicalUrl,
      siteName: siteName,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: page.socialImageAlt || title }]
        : undefined,
      locale: locale,
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
      const creatorHandle = twitterCreator.replace(/^@/, "");
      twitter.creator = `@${creatorHandle}`;
    }

    return {
      title: `${title} - ${siteName}`,
      description: description,
      alternates: {
        canonical: canonicalUrl,
      },
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
    console.error("Error generating metadata for copyright policy page:", error);
    // Fallback to default metadata
    return {
      title: "سياسة حقوق النشر - مدونتي",
      description: "سياسة حقوق النشر والملكية الفكرية لمنصة مدونتي",
    };
  }
}

function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

function CopyrightPolicyFallback() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
      <div className="h-10 w-full bg-muted animate-pulse rounded mb-6" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

async function CopyrightPolicyContent() {
  let page;
  let hasContent = false;

  try {
    page = await getCopyrightPolicyPageContent();
    if (page && page.content) {
      hasContent = true;
    }
  } catch (error) {
    console.error("Error fetching copyright policy page:", error);
  }

  // Fallback content
  const fallbackTitle = "سياسة حقوق النشر";
  const fallbackContent = `
    <p>
      جميع المحتويات الموجودة على منصة مدونتي محمية بحقوق الطبع والنشر. توضح هذه
      السياسة حقوق الملكية الفكرية وكيفية استخدام المحتوى.
    </p>
    <h2>1. حقوق الملكية</h2>
    <p>
      جميع المحتويات الموجودة على المنصة، بما في ذلك النصوص والصور والتصاميم، محمية
      بحقوق الطبع والنشر وهي ملك لصاحبها أو لصالح مدونتي.
    </p>
    <h2>2. استخدام المحتوى</h2>
    <p>
      لا يجوز نسخ أو توزيع أو تعديل أو إنشاء أعمال مشتقة من محتوى المنصة دون الحصول
      على إذن كتابي مسبق من صاحب الحقوق.
    </p>
    <h2>3. المحتوى المقدم من المستخدمين</h2>
    <p>
      عند تقديم محتوى للمنصة، فإنك تمنحنا ترخيصاً لاستخدام وعرض وتوزيع هذا المحتوى
      على المنصة. أنت تتحمل المسؤولية الكاملة عن المحتوى الذي تقدمه.
    </p>
    <h2>4. انتهاك حقوق النشر</h2>
    <p>
      نحن نحترم حقوق الملكية الفكرية للآخرين. إذا كنت تعتقد أن محتوى على المنصة
      ينتهك حقوقك، يرجى التواصل معنا.
    </p>
    <h2>5. العلامات التجارية</h2>
    <p>
      جميع العلامات التجارية والأسماء التجارية المستخدمة على المنصة هي ملك لأصحابها
      المعنيين.
    </p>
  `;

  const pageTitle = page?.title || fallbackTitle;
  const pageContent = hasContent ? page!.content : fallbackContent;

  const structuredData = generateStructuredData({
    type: "WebPage",
    name: `${pageTitle} - مدونتي`,
    description: "سياسة حقوق النشر والملكية الفكرية لمنصة مدونتي",
    url: "/legal/copyright-policy",
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
            { label: "القانونية", href: "/legal" },
            { label: pageTitle },
          ]}
        />
        <div className="prose prose-sm max-w-none">
          <h1 className="text-3xl font-bold mb-6">{pageTitle}</h1>
          {page?.updatedAt && (
            <p className="text-sm text-muted-foreground mb-6">
              آخر تحديث:{" "}
              <Suspense fallback={<span>...</span>}>
                <FormattedDate date={page.updatedAt} />
              </Suspense>
            </p>
          )}
          <div
            className="space-y-6 text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        </div>
      </div>
    </>
  );
}

export default function CopyrightPolicyPage() {
  return (
    <Suspense fallback={<CopyrightPolicyFallback />}>
      <CopyrightPolicyContent />
    </Suspense>
  );
}
