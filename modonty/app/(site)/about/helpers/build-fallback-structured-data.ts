import { generateStructuredData } from "@/lib/seo";
import { messages } from "@/lib/i18n/messages";

export function buildFallbackStructuredData(pageTitle: string) {
  return generateStructuredData({
    type: "AboutPage",
    // بلا لاحقة الماركة: هذا اسم **الصفحة** في البيانات المنظَّمة، واسم الموقع يعيش على
    // عقدة `WebSite` وفي `og:site_name`. إلحاقه هنا كرّر الماركة وكتبها في الكود معاً.
    name: pageTitle,
    description: messages.seo.about.description,
    url: "/about",
  });
}
