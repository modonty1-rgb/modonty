import { Metadata } from "next";
import { generateStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { db } from "@/lib/db";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await db.modonty.findUnique({
      where: { slug: "user-agreement" },
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
        title: "اتفاقية المستخدم - مودونتي",
        description: "اتفاقية استخدام منصة مودونتي - الشروط والأحكام التي تحكم استخدامك للمنصة",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
    const siteName = page.ogSiteName || "مودونتي";
    const title = page.seoTitle || page.title || "اتفاقية المستخدم";
    const description = page.seoDescription || "اتفاقية استخدام منصة مودونتي - الشروط والأحكام التي تحكم استخدامك للمنصة";
    const canonicalUrl = page.canonicalUrl || `${siteUrl}/legal/user-agreement`;
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
    console.error("Error generating metadata for user agreement page:", error);
    // Fallback to default metadata
    return {
      title: "اتفاقية المستخدم - مودونتي",
      description: "اتفاقية استخدام منصة مودونتي - الشروط والأحكام التي تحكم استخدامك للمنصة",
    };
  }
}

function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

export default async function UserAgreementPage() {
  let page;
  let hasContent = false;

  try {
    page = await db.modonty.findUnique({
      where: { slug: "user-agreement" },
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
    console.error("Error fetching user agreement page:", error);
  }

  // Fallback content
  const fallbackTitle = "اتفاقية المستخدم";
  const fallbackContent = `
    <p>
      هذه الاتفاقية تحكم استخدامك لمنصة مودونتي. من خلال الوصول إلى المنصة أو استخدامها،
      فإنك توافق على الالتزام بهذه الشروط والأحكام.
    </p>
    <h2>1. قبول الشروط</h2>
    <p>
      عند الوصول إلى منصة مودونتي واستخدامها، فإنك تقر بأنك قد قرأت وفهمت ووافقت على
      الالتزام بهذه الاتفاقية وجميع القوانين واللوائح المعمول بها.
    </p>
    <h2>2. استخدام المنصة</h2>
    <p>
      يمكنك استخدام منصة مودونتي للأغراض القانونية فقط. لا يجوز لك استخدام المنصة
      بأي طريقة قد تتعارض مع القوانين المعمول بها أو تنتهك حقوق الآخرين.
    </p>
    <h2>3. المحتوى</h2>
    <p>
      جميع المحتويات الموجودة على المنصة محمية بحقوق الطبع والنشر. لا يجوز نسخ أو
      توزيع أو تعديل أي محتوى دون الحصول على إذن كتابي مسبق.
    </p>
    <h2>4. الخصوصية</h2>
    <p>
      يرجى مراجعة سياسة الخصوصية الخاصة بنا لفهم كيفية جمع واستخدام معلوماتك الشخصية.
    </p>
    <h2>5. التعديلات</h2>
    <p>
      نحتفظ بالحق في تعديل هذه الاتفاقية في أي وقت. سيتم إشعارك بأي تغييرات جوهرية
      من خلال المنصة.
    </p>
  `;

  const pageTitle = page?.title || fallbackTitle;
  const pageContent = hasContent ? page!.content : fallbackContent;

  const structuredData = generateStructuredData({
    type: "WebPage",
    name: `${pageTitle} - مودونتي`,
    description: "اتفاقية استخدام منصة مودونتي - الشروط والأحكام التي تحكم استخدامك للمنصة",
    url: "/legal/user-agreement",
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
