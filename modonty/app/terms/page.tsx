import { Metadata } from "next";
import { Suspense } from "react";
import { generateStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { FormattedDate } from "@/components/date/FormattedDate";
import { getTermsPageForMetadata } from "./helpers/terms-metadata";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getTermsPageContent } from "./helpers/terms-content";

// Tags come from this page's row, then the Settings defaults, then these literals —
// one builder for every editable page so the chain can never lose its middle link.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getTermsPageForMetadata(), {
    path: "/terms",
    fallbackTitle: "الشروط والأحكام",
    fallbackDescription: "اقرأ شروط وأحكام استخدام منصة مدونتي",
  });
}


function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

function TermsFallback() {
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

async function TermsContent() {
  let page;
  let hasContent = false;

  try {
    page = await getTermsPageContent();
    if (page && page.content) {
      hasContent = true;
    }
  } catch (error) {
    console.error("Error fetching terms page:", error);
  }

  const fallbackTitle = "الشروط والأحكام";
  const fallbackContent = `
    <p>
      مرحباً بك في منصة مدونتي. يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام خدماتنا.
    </p>
    <h2>1. قبول الشروط</h2>
    <p>
      باستخدام منصة مدونتي، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، فيرجى عدم استخدام خدماتنا.
    </p>
    <h2>2. استخدام الخدمة</h2>
    <p>
      يجب استخدام منصة مدونتي فقط للأغراض القانونية وبما يتوافق مع جميع القوانين واللوائح المعمول بها.
    </p>
    <h2>3. المحتوى</h2>
    <p>
      أنت مسؤول عن المحتوى الذي تنشره على المنصة. يجب أن يكون المحتوى دقيقاً ولا ينتهك حقوق أي طرف ثالث.
    </p>
    <h2>4. الملكية الفكرية</h2>
    <p>
      جميع المحتويات الموجودة على المنصة محمية بحقوق الطبع والنشر. لا يجوز نسخ أو توزيع أو تعديل أي محتوى دون إذن كتابي.
    </p>
    <h2>5. التعديلات</h2>
    <p>
      نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إشعارك بأي تغييرات جوهرية.
    </p>
  `;

  const pageTitle = page?.title || fallbackTitle;
  const pageContent = hasContent ? page!.content : fallbackContent;

  // Prefer the stored, admin-validated card; build live ONLY when it is absent.
  const storedJsonLd = page?.jsonLdStructuredData?.trim();
  const buildFallbackStructuredData = () => generateStructuredData({
    type: "WebPage",
    name: `${pageTitle} - مدونتي`,
    description: "اقرأ شروط وأحكام استخدام منصة مدونتي",
    url: "/terms",
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

export default function TermsPage() {
  return (
    <Suspense fallback={<TermsFallback />}>
      <TermsContent />
    </Suspense>
  );
}
