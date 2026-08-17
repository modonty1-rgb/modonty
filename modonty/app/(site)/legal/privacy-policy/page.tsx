import { Metadata } from "next";
import { Suspense } from "react";
import { generateStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { FormattedDate } from "@/components/date/FormattedDate";
import { getPrivacyPolicyPageForMetadata } from "./helpers/privacy-policy-metadata";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getPrivacyPolicyPageContent } from "./helpers/privacy-policy-content";

// Tags come from this page's row, then the Settings defaults, then these literals —
// one builder for every editable page so the chain can never lose its middle link.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getPrivacyPolicyPageForMetadata(), {
    path: "/legal/privacy-policy",
    fallbackTitle: "سياسة الخصوصية",
    fallbackDescription: "تعرف على كيفية جمع واستخدام وحماية معلوماتك الشخصية في منصة مدونتي",
  });
}


function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

function PrivacyPolicyFallback() {
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

async function PrivacyPolicyContent() {
  let page;
  let hasContent = false;

  try {
    page = await getPrivacyPolicyPageContent();
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
      نحن في مدونتي ملتزمون بحماية خصوصيتك. توضح هذه السياسة كيفية جمع واستخدام
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

  // Prefer the stored, admin-validated card; build live ONLY when it is absent.
  const storedJsonLd = page?.jsonLdStructuredData?.trim();
  const buildFallbackStructuredData = () => generateStructuredData({
    type: "WebPage",
    name: `${pageTitle} - مدونتي`,
    description: "تعرف على كيفية جمع واستخدام وحماية معلوماتك الشخصية في منصة مدونتي",
    url: "/legal/privacy-policy",
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

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={<PrivacyPolicyFallback />}>
      <PrivacyPolicyContent />
    </Suspense>
  );
}
