import { Metadata } from "next";
import { generateMetadataFromSEO } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ContactForm } from "@/app/contact/components/contact-form";

export const metadata: Metadata = generateMetadataFromSEO({
  title: "إرسال ملاحظات",
  description: "شاركنا ملاحظاتك واقتراحاتك لمساعدتنا على تحسين منصة مودونتي",
  keywords: ["ملاحظات", "اقتراحات", "تغذية راجعة", "تحسين"],
  url: "/help/feedback",
  type: "website",
});

export const revalidate = 3600;

export default function FeedbackPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "مركز المساعدة", href: "/help" },
          { label: "إرسال ملاحظات" },
        ]}
      />
      <h1 className="text-3xl font-bold mb-6">إرسال ملاحظات</h1>
      <p className="text-muted-foreground mb-8">
        نحن نقدر ملاحظاتك واقتراحاتك! شاركنا أفكارك لمساعدتنا على تحسين منصة مودونتي
        وتقديم تجربة أفضل لك.
      </p>
      <ContactForm />
    </div>
  );
}
