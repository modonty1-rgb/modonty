import { Metadata } from "next";
import { Suspense } from "react";
import { generateStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { FormattedDate } from "@/components/date/FormattedDate";
import { getUserAgreementPageForMetadata } from "./helpers/user-agreement-metadata";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getUserAgreementPageContent } from "./helpers/user-agreement-content";

// Tags come from this page's row, then the Settings defaults, then these literals —
// one builder for every editable page so the chain can never lose its middle link.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getUserAgreementPageForMetadata(), {
    path: "/legal/user-agreement",
    fallbackTitle: "اتفاقية المستخدم",
    fallbackDescription: "اتفاقية استخدام منصة مدونتي - الشروط والأحكام التي تحكم استخدامك للمنصة",
  });
}


function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

function UserAgreementFallback() {
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

async function UserAgreementContent() {
  let page;
  let hasContent = false;

  try {
    page = await getUserAgreementPageContent();
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
      هذه الاتفاقية تحكم استخدامك لمنصة مدونتي. من خلال الوصول إلى المنصة أو استخدامها،
      فإنك توافق على الالتزام بهذه الشروط والأحكام.
    </p>
    <h2>1. قبول الشروط</h2>
    <p>
      عند الوصول إلى منصة مدونتي واستخدامها، فإنك تقر بأنك قد قرأت وفهمت ووافقت على
      الالتزام بهذه الاتفاقية وجميع القوانين واللوائح المعمول بها.
    </p>
    <h2>2. استخدام المنصة</h2>
    <p>
      يمكنك استخدام منصة مدونتي للأغراض القانونية فقط. لا يجوز لك استخدام المنصة
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

  // Prefer the stored, admin-validated card; build live ONLY when it is absent.
  const storedJsonLd = page?.jsonLdStructuredData?.trim();
  const buildFallbackStructuredData = () => generateStructuredData({
    type: "WebPage",
    name: `${pageTitle} - مدونتي`,
    description: "اتفاقية استخدام منصة مدونتي - الشروط والأحكام التي تحكم استخدامك للمنصة",
    url: "/legal/user-agreement",
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

export default function UserAgreementPage() {
  return (
    <Suspense fallback={<UserAgreementFallback />}>
      <UserAgreementContent />
    </Suspense>
  );
}
