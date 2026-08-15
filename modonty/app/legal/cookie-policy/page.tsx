import { Metadata } from "next";
import { Suspense } from "react";
import { generateStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { FormattedDate } from "@/components/date/FormattedDate";
import { getCookiePolicyPageForMetadata } from "./helpers/cookie-policy-metadata";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getCookiePolicyPageContent } from "./helpers/cookie-policy-content";

// Tags come from this page's row, then the Settings defaults, then these literals —
// one builder for every editable page so the chain can never lose its middle link.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getCookiePolicyPageForMetadata(), {
    path: "/legal/cookie-policy",
    fallbackTitle: "سياسة ملفات تعريف الارتباط",
    fallbackDescription: "تعرف على كيفية استخدام منصة مدونتي لملفات تعريف الارتباط (Cookies)",
  });
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
      تستخدم منصة مدونتي ملفات تعريف الارتباط (Cookies) لتحسين تجربتك على المنصة.
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

  // Prefer the stored, admin-validated card; build live ONLY when it is absent.
  const storedJsonLd = page?.jsonLdStructuredData?.trim();
  const buildFallbackStructuredData = () => generateStructuredData({
    type: "WebPage",
    name: `${pageTitle} - مدونتي`,
    description: "تعرف على كيفية استخدام منصة مدونتي لملفات تعريف الارتباط (Cookies)",
    url: "/legal/cookie-policy",
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
