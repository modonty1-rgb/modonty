import { Metadata } from "next";
import { generateMetadataFromSEO, generateStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ContactForm } from "./components/contact-form";

export const metadata: Metadata = generateMetadataFromSEO({
  title: "اتصل بنا",
  description: "تواصل مع فريق مودونتي. نحن هنا للإجابة على أسئلتك ومساعدتك",
  keywords: ["اتصال", "دعم", "مساعدة", "تواصل"],
  url: "/contact",
  type: "website",
});

export const revalidate = 3600;

function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

export default function ContactPage() {
  const structuredData = generateStructuredData({
    type: "ContactPage",
    name: "اتصل بنا - مودونتي",
    description: "صفحة التواصل مع فريق مودونتي",
    url: "/contact",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(structuredData) }}
      />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: "اتصل بنا" },
          ]}
        />
        <h1 className="text-3xl font-bold mb-6">اتصل بنا</h1>
        <p className="text-muted-foreground mb-8">
          نرحب بأسئلتك وملاحظاتك. يرجى ملء النموذج أدناه وسنقوم بالرد عليك في أقرب وقت ممكن.
        </p>
        <ContactForm />
      </div>
    </>
  );
}
