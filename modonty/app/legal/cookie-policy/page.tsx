import { Metadata } from "next";
import { Suspense } from "react";
import { generateStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { FormattedDate } from "@/components/FormattedDate";
import { getCookiePolicyPageForMetadata } from "./helpers/cookie-policy-metadata";
import { getCookiePolicyPageContent } from "./helpers/cookie-policy-content";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getCookiePolicyPageForMetadata();

    if (!page) {
      // Fallback to default metadata
      return {
        title: "سياسة ملفات تعريف الارتباط - مودونتي",
        description: "تعرف على كيفية استخدام منصة مودونتي لملفات تعريف الارتباط (Cookies)",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
    const siteName = page.ogSiteName || "مودونتي";
    const title = page.seoTitle || page.title || "سياسة ملفات تعريف الارتباط";
    const description = page.seoDescription || "تعرف على كيفية استخدام منصة مودونتي لملفات تعريف الارتباط (Cookies)";
    const canonicalUrl = page.canonicalUrl || `${siteUrl}/legal/cookie-policy`;
    const ogImage = page.ogImage || page.socialImage || `${siteUrl}/og-image.jpg`;
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
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: page.socialImageAlt || title,
        },
      ],
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
    console.error("Error generating metadata for cookie policy page:", error);
    // Fallback to default metadata
    return {
      title: "سياسة ملفات تعريف الارتباط - مودونتي",
      description: "تعرف على كيفية استخدام منصة مودونتي لملفات تعريف الارتباط (Cookies)",
    };
  }
}

function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

async function CookiePolicyContent() {
  let page;
  let hasContent = false;

  try {
    page = await getCookiePolicyPageContent();
    if (page && page.content) {
      hasContent = true;
    }
  } catch (error) {
    console.error("Error fetching cookie policy page:", error);
  }

  // Fallback content
  const fallbackTitle = "سياسة ملفات تعريف الارتباط";
  const fallbackContent = `
    <p>
      تستخدم منصة مودونتي ملفات تعريف الارتباط (Cookies) لتحسين تجربتك على المنصة.
      توضح هذه السياسة أنواع ملفات تعريف الارتباط التي نستخدمها وكيفية استخدامها.
    </p>
    <h2>1. ما هي ملفات تعريف الارتباط</h2>
    <p>
      ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة
      موقع ويب. تساعدنا هذه الملفات في تذكر تفضيلاتك وتحسين تجربتك.
    </p>
    <h2>2. أنواع ملفات تعريف الارتباط التي نستخدمها</h2>
    <p>
      نستخدم ملفات تعريف الارتباط الضرورية لتشغيل المنصة، وملفات تعريف الارتباط
      الوظيفية لتحسين الوظائف، وملفات تعريف الارتباط التحليلية لفهم كيفية استخدام
      المنصة.
    </p>
    <h2>3. كيفية إدارة ملفات تعريف الارتباط</h2>
    <p>
      يمكنك إدارة تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك.
      يرجى ملاحظة أن تعطيل بعض ملفات تعريف الارتباط قد يؤثر على وظائف المنصة.
    </p>
    <h2>4. ملفات تعريف الارتباط من أطراف ثالثة</h2>
    <p>
      قد نستخدم خدمات من أطراف ثالثة تستخدم ملفات تعريف الارتباط الخاصة بها. لا
      نتحكم في ملفات تعريف الارتباط هذه.
    </p>
  `;

  const pageTitle = page?.title || fallbackTitle;
  const pageContent = hasContent ? page!.content : fallbackContent;

  const structuredData = generateStructuredData({
    type: "WebPage",
    name: `${pageTitle} - مودونتي`,
    description: "تعرف على كيفية استخدام منصة مودونتي لملفات تعريف الارتباط (Cookies)",
    url: "/legal/cookie-policy",
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

function CookiePolicyFallback() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
      <div className="h-10 w-full bg-muted animate-pulse rounded mb-6" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
        <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function CookiePolicyPage() {
  return (
    <Suspense fallback={<CookiePolicyFallback />}>
      <CookiePolicyContent />
    </Suspense>
  );
}
