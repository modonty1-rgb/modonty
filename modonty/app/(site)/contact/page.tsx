import { Metadata } from "next";
import { generateStructuredData, jsonLdHtmlFromString } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ContactForm } from "@/components/shared/contact-form/ContactForm";
import { auth } from "@/lib/auth";
import { getContactPageForMetadata } from "./helpers/contact-metadata";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getContactPageContent } from "./helpers/contact-content";
import { ContactIntro } from "./components/contact-intro/ContactIntro";
import { ContactDetails } from "./components/contact-details/ContactDetails";
import { getLegalEntity } from "@/lib/seo/organization-jsonld";
import { toLegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";
import { messages } from "@/lib/i18n/messages";

const FALLBACK_TITLE = "اتصل بنا";
const FALLBACK_DESCRIPTION = messages.seo.contact.description;

// Contact holds the phone, email and address a visitor acts on — the details most likely
// to change. It was the last modonty page whose copy needed a deploy to edit; now it reads
// its row from the DB like /about and the legal pages, and falls back to these constants
// only while the row is still empty.
// Tags come from this page row, then the Settings defaults, then these constants —
// one builder for every editable page so the chain can never lose its middle link.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getContactPageForMetadata(), {
    path: "/contact",
    // لا احتياط للعنوان: صفّ `/contact` يحمله. والوصف يبقى مؤقّتاً — الصفّ بلا وصف
    // اليوم (مقيس ٢٨ أغسطس)، وحذفه يُسقط وسماً حيّاً بدل أن يكشف نقصاً.
    fallbackDescription: FALLBACK_DESCRIPTION,
  });
}

function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

export default async function ContactPage() {
  const [session, page, legal] = await Promise.all([
    auth(),
    getContactPageContent(),
    getLegalEntity(),
  ]);
  const entity = toLegalEntityDisplay(legal);
  const defaultName = session?.user?.name ?? null;
  const defaultEmail = session?.user?.email ?? null;

  const pageTitle = page?.title?.trim() || FALLBACK_TITLE;
  const intro = page?.content?.trim();

  // Prefer the stored, admin-validated card; build live ONLY when it is absent.
  const storedJsonLd = page?.jsonLdStructuredData?.trim();
  const buildFallbackStructuredData = () =>
    generateStructuredData({
      type: "ContactPage",
      // بلا لاحقة الماركة: هذا اسم الصفحة، واسم الموقع على عقدة WebSite وفي og:site_name.
      name: pageTitle,
      description: FALLBACK_DESCRIPTION,
      url: "/contact",
    });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: storedJsonLd
            ? jsonLdHtmlFromString(storedJsonLd)
            : sanitizeJsonLd(buildFallbackStructuredData()),
        }}
      />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: pageTitle },
          ]}
        />
        <ContactIntro title={pageTitle} html={intro} />
        <ContactDetails
          email={entity.contactEmail}
          telephone={entity.contactTelephone}
          address={entity.address}
        />
        <ContactForm defaultName={defaultName} defaultEmail={defaultEmail} />
      </div>
    </>
  );
}
