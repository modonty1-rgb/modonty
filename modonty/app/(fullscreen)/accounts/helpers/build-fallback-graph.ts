import { SITE_URL } from "@/constants";
import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";

export const FALLBACK_DESCRIPTION = "كل حسابات مدونتي على منصّات التواصل في مكانٍ واحد.";

/**
 * قبل أن يُحفظ سجلُّ الصفحة في الأدمن لا يوجد graph مخزَّن — فلا تخرج الصفحةُ بلا بيانات
 * منظّمة: نفسُ الشكل الذي يولّده الأدمن، بأقلّ حقوله.
 */
export function buildFallbackGraph(sameAs: string[]): object {
  const { organization } = buildSiteEntityIds(SITE_URL);
  const url = `${SITE_URL}/accounts`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": organization, url: SITE_URL, ...(sameAs.length ? { sameAs } : {}) },
      { "@type": "ProfilePage", "@id": `${url}#profilepage`, url, name: "حساباتنا", description: FALLBACK_DESCRIPTION, mainEntity: { "@id": organization } },
    ],
  };
}
