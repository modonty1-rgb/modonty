import { Metadata } from "next";
import { generateMetadataFromSEO } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ContactForm } from "@/components/shared/contact-form/ContactForm";
import { messages } from "@/lib/i18n/messages";
import { FeedbackIntro } from "./components/feedback-intro/FeedbackIntro";

const text = messages.feedback;

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataFromSEO({
    title: "إرسال ملاحظات",
    description: messages.seo.feedback.description,
    keywords: ["ملاحظات", "اقتراحات", "تغذية راجعة", "تحسين"],
    url: "/help/feedback",
    type: "website",
    robots: "noindex,nofollow",
  });
}

export default function FeedbackPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: text.helpBreadcrumbLabel, href: "/help" },
          { label: text.breadcrumbLabel },
        ]}
      />
      <FeedbackIntro />
      <ContactForm />
    </div>
  );
}
