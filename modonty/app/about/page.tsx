import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { generateStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { getAboutPageForMetadata } from "./helpers/about-metadata";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getAboutPageContent } from "./helpers/about-content";

// Tags come from this page's row, then the Settings defaults, then these literals —
// one builder for every editable page so the chain can never lose its middle link.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getAboutPageForMetadata(), {
    path: "/about",
    fallbackTitle: "من نحن",
    fallbackDescription: "تعرف على منصة مدونتي - منصة المدونات الاحترافية متعددة الشركاء",
  });
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
      مدونتي هي منصة مدونات احترافية متعددة الشركاء تهدف إلى توفير حل شامل لإدارة
      المحتوى وإنشاء المدونات للشركات والمؤسسات.
    </p>
    <h2>رؤيتنا</h2>
    <p>
      نطمح إلى أن نكون المنصة الرائدة في المنطقة العربية لإدارة المحتوى والمدونات،
      حيث يمكن للشركات والمؤسسات إنشاء وإدارة محتواها بسهولة واحترافية.
    </p>
    <h2>مهمتنا</h2>
    <p>
      مهمتنا هي توفير أدوات قوية وسهلة الاستخدام تمكن الشركاء من إنشاء محتوى عالي
      الجودة وإدارته بكفاءة، مع الحفاظ على المرونة والتخصيص.
    </p>
    <h2>ما نقدمه</h2>
    <ul>
      <li>منصة متعددة الشركاء لإدارة المحتوى</li>
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

  // Prefer the stored, admin-validated card; build live ONLY when it is absent.
  const storedJsonLd = page?.jsonLdStructuredData?.trim();
  const buildFallbackStructuredData = () => generateStructuredData({
    type: "AboutPage",
    name: `${pageTitle} - مدونتي`,
    description: "تعرف على منصة مدونتي",
    url: "/about",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: storedJsonLd ?? sanitizeJsonLd(buildFallbackStructuredData()) }}
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
            <OptimizedImage
              media={asMedia(heroImage)}
              alt={heroImageAlt || "من نحن - مدونتي"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              preload
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
            هل تريد عملاء من جوجل بدون إعلانات؟ مدونتي تُنشئ لك محتوى SEO احترافياً يظهر في أعلى نتائج البحث ويجذب عملاء حقيقيين.
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
