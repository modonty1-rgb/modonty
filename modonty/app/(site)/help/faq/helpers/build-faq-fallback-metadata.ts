import { generateMetadataFromSEO } from "@/lib/seo";
import { messages } from "@/lib/i18n/messages";

export function buildFaqFallbackMetadata() {
  return generateMetadataFromSEO({
    title: "الأسئلة الشائعة",
    description: messages.seo.faq.description,
    keywords: ["أسئلة", "شائعة", "مساعدة", "دعم"],
    url: "/help/faq",
    type: "website",
  });
}
