import type { PartnerForCard } from "../data/get-industry-scope";

/** A ranked partner as the answer card shows it — `canBook` is what turns a name into a lead. */
export function toPartnerCard(p: PartnerForCard, scopeName: string) {
  return {
    name: p.name,
    slug: p.slug,
    canBook: p.ctaMode !== "NONE",
    whyRecommended: p.slogan?.trim() || p.description?.trim() || `من شركاء ${scopeName}`,
    logo: p.logo,
    city: p.city,
    credential: p.credential,
    isVerified: p.isVerified,
  };
}
