import { generateBreadcrumbStructuredData } from "@/lib/seo";
import { SITE_URL } from "@/constants";
import { messages } from "@/lib/i18n/messages";
import type { TagListItem } from "./tag-types";

// Built only when the cache is empty — mapping the tag list on every request just to throw
// the result away is work nobody reads.
export const buildFallbackJsonLd = (all: TagListItem[]) => {
  // `SITE_URL` يقرأ نفس المتغيّر ويقصّ الشرطة — نسخةٌ ثانية تعني رابطين قد يفترقان.
  const siteUrl = SITE_URL;
  return {
    breadcrumb: generateBreadcrumbStructuredData([
      { name: "الرئيسية", url: "/" },
      { name: "الوسوم", url: "/tags" },
    ]),
    collection: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      // بلا لاحقة الماركة — اسم المجموعة وحده.
      name: "الوسوم",
      description: messages.seo.tags.shortDescription,
      url: `${siteUrl}/tags`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: all.length,
        itemListElement: all.slice(0, 20).map((tag, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: { "@type": "DefinedTerm", name: tag.name, url: `${siteUrl}/tags/${tag.slug}` },
        })),
      },
    },
  };
};
