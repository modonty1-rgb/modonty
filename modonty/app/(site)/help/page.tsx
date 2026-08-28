import { Metadata } from "next";
import { generateMetadataFromSEO } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { messages } from "@/lib/i18n/messages";
import { HelpHeader } from "./components/help-header/HelpHeader";
import { HelpLinks } from "./components/help-links/HelpLinks";

const text = messages.help;

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataFromSEO({
    title: "مركز المساعدة",
    description: messages.seo.help.description,
    keywords: ["مساعدة", "دعم", "مركز المساعدة", "أسئلة"],
    url: "/help",
    type: "website",
  });
}

export default function HelpPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Same trail as the visible nav below — Google reads this one, not the markup. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            generateBreadcrumbStructuredData([
              { name: "الرئيسية", url: "/" },
              { name: "مركز المساعدة", url: "/help" },
            ])
          ),
        }}
      />
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: text.breadcrumbLabel },
        ]}
      />
      <HelpHeader />
      <HelpLinks />
    </div>
  );
}
