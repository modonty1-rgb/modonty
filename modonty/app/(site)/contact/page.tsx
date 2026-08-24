import { Metadata } from "next";
import { generateStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ContactForm } from "@/components/shared/contact-form/ContactForm";
import { auth } from "@/lib/auth";
import { getContactPageForMetadata } from "./helpers/contact-metadata";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getContactPageContent } from "./helpers/contact-content";
import { BRAND_AR } from "@/constants";
import { ContactIntro } from "./components/contact-intro/ContactIntro";

const FALLBACK_TITLE = "اتصل بنا";
const FALLBACK_DESCRIPTION = "تواصل مع فريق مدونتي. نحن هنا للإجابة على أسئلتك ومساعدتك";

// Contact holds the phone, email and address a visitor acts on — the details most likely
// to change. It was the last modonty page whose copy needed a deploy to edit; now it reads
// its row from the DB like /about and the legal pages, and falls back to these constants
// only while the row is still empty.
// Tags come from this page row, then the Settings defaults, then these constants —
// one builder for every editable page so the chain can never lose its middle link.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getContactPageForMetadata(), {
    path: "/contact",
    fallbackTitle: FALLBACK_TITLE,
    fallbackDescription: FALLBACK_DESCRIPTION,
  });
}

function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

export default async function ContactPage() {
  const [session, page] = await Promise.all([auth(), getContactPageContent()]);
  const defaultName = session?.user?.name ?? null;
  const defaultEmail = session?.user?.email ?? null;

  const pageTitle = page?.title?.trim() || FALLBACK_TITLE;
  const intro = page?.content?.trim();

  // Prefer the stored, admin-validated card; build live ONLY when it is absent.
  const storedJsonLd = page?.jsonLdStructuredData?.trim();
  const buildFallbackStructuredData = () =>
    generateStructuredData({
      type: "ContactPage",
      name: `${pageTitle} - ${BRAND_AR}`,
      description: FALLBACK_DESCRIPTION,
      url: "/contact",
    });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: storedJsonLd ?? sanitizeJsonLd(buildFallbackStructuredData()),
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
        <ContactForm defaultName={defaultName} defaultEmail={defaultEmail} />
      </div>
    </>
  );
}
