import { Metadata } from "next";
import { generateStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { db } from "@/lib/db";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await db.modonty.findUnique({
      where: { slug: "privacy-policy" },
      select: {
        title: true,
        seoTitle: true,
        seoDescription: true,
        metaRobots: true,
        socialImage: true,
        socialImageAlt: true,
        ogTitle: true,
        ogDescription: true,
        ogType: true,
        ogUrl: true,
        ogSiteName: true,
        ogLocale: true,
        ogImage: true,
        twitterCard: true,
        twitterTitle: true,
        twitterDescription: true,
        twitterSite: true,
        twitterCreator: true,
        canonicalUrl: true,
        inLanguage: true,
      },
    });

    if (!page) {
      // Fallback to default metadata
      return {
        title: "سياسة الخصوصية - مودونتي",
        description: "تعرف على كيفية جمع واستخدام وحماية معلوماتك الشخصية في منصة مودونتي",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
    const siteName = page.ogSiteName || "مودونتي";
    const title = page.seoTitle || page.title || "سياسة الخصوصية";
    const description = page.seoDescription || "تعرف على كيفية جمع واستخدام وحماية معلوماتك الشخصية في منصة مودونتي";
    const canonicalUrl = page.canonicalUrl || `${siteUrl}/legal/privacy-policy`;
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
    console.error("Error generating metadata for privacy policy page:", error);
    // Fallback to default metadata
    return {
      title: "سياسة الخصوصية - مودونتي",
      description: "تعرف على كيفية جمع واستخدام وحماية معلوماتك الشخصية في منصة مودونتي",
    };
  }
}

function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

export default async function PrivacyPolicyPage() {
  let page;
  let hasContent = false;

  try {
    page = await db.modonty.findUnique({
      where: { slug: "privacy-policy" },
      select: {
        title: true,
        content: true,
        updatedAt: true,
      },
    });

    if (page && page.content) {
      hasContent = true;
    }
  } catch (error) {
    console.error("Error fetching privacy policy page:", error);
  }

  // Fallback content
  const fallbackTitle = "سياسة الخصوصية";
  const fallbackContent = `
    <p>
      نحن في مودونتي ملتزمون بحماية خصوصيتك. توضح هذه السياسة كيفية جمع واستخدام
      وحماية معلوماتك الشخصية.
    </p>
    <h2>1. المعلومات التي نجمعها</h2>
    <p>
      نجمع معلومات قد تشمل اسمك وعنوان بريدك الإلكتروني ومعلومات أخرى تقدمها لنا
      طواعية عند التسجيل أو استخدام خدماتنا.
    </p>
    <h2>2. كيفية استخدام المعلومات</h2>
    <p>
      نستخدم المعلومات التي نجمعها لتقديم وتحسين خدماتنا، والتواصل معك، وضمان
      أمان المنصة.
    </p>
    <h2>3. حماية المعلومات</h2>
    <p>
      نتخذ إجراءات أمنية معقولة لحماية معلوماتك الشخصية من الوصول غير المصرح به
      أو التغيير أو الكشف أو التدمير.
    </p>
    <h2>4. مشاركة المعلومات</h2>
    <p>
      لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في
      الحالات المحددة في هذه السياسة.
    </p>
    <h2>5. حقوقك</h2>
    <p>
      لديك الحق في الوصول إلى معلوماتك الشخصية وتصحيحها أو حذفها. يمكنك ممارسة
      هذه الحقوق من خلال التواصل معنا.
    </p>
  `;

  const pageTitle = page?.title || fallbackTitle;
  const pageContent = hasContent ? page!.content : fallbackContent;

  const structuredData = generateStructuredData({
    type: "WebPage",
    name: `${pageTitle} - مودونتي`,
    description: "تعرف على كيفية جمع واستخدام وحماية معلوماتك الشخصية في منصة مودونتي",
    url: "/legal/privacy-policy",
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
              آخر تحديث: {new Date(page.updatedAt).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
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
