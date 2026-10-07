import { generateStructuredData } from "@/lib/seo";
import { messages } from "@/lib/i18n/messages";

export function buildFallbackStructuredData(pageTitle: string) {
  return generateStructuredData({
    type: "ContactPage",
    // بلا لاحقة الماركة: هذا اسم الصفحة، واسم الموقع على عقدة WebSite وفي og:site_name.
    name: pageTitle,
    description: messages.seo.contact.description,
    url: "/contact",
  });
}
