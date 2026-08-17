import type { PartnerSite } from "../../helpers/get-partner-site";

export interface PartnerNavItem {
  href: string;
  label: string;
}

/**
 * The partner site's menu, built from what the partner actually has — a link only
 * exists when its page has content (no services → no «خدماته»). Order = the visitor's
 * questions: what do they offer → proof → who are they → what they write → how to reach.
 */
export function buildPartnerNav(site: PartnerSite): PartnerNavItem[] {
  const base = `/clients/${encodeURIComponent(site.slug)}`;
  const items: PartnerNavItem[] = [{ href: base, label: "الرئيسية" }];
  if (site.services.length > 0) items.push({ href: `${base}/services`, label: "خدماته" });
  if (site._count.media > 0) items.push({ href: `${base}/photos`, label: "أعماله" });
  if (site._count.reviews > 0) items.push({ href: `${base}/reviews`, label: "آراء عملائه" });
  items.push({ href: `${base}/about`, label: "من هو" });
  if (site._count.articles > 0) items.push({ href: `${base}/articles`, label: "مقالاته" });
  if (site._count.clientFaqs > 0) items.push({ href: `${base}/faq`, label: "الأسئلة" });
  items.push({ href: `${base}/contact`, label: "تواصل" });
  return items;
}
