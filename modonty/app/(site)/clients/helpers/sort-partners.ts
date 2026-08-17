import type { ClientListItem } from "@/lib/queries/get-clients-list";

/**
 * One fixed order, no control on the page (Khalid, 2026-08-16): featured partners lead —
 * the admin toggle is what «شريك مميّز» means — then whoever publishes most, and the name
 * breaks ties so the list never shuffles between two identical requests.
 *
 * Sorts a copy: the cached list must never be reordered in place, or the next visitor
 * inherits this request's order.
 */
export function sortPartners(partners: ClientListItem[]): ClientListItem[] {
  return [...partners].sort((first, second) => {
    if (first.isFeatured !== second.isFeatured) return first.isFeatured ? -1 : 1;
    if (first.articleCount !== second.articleCount) return second.articleCount - first.articleCount;
    return first.name.localeCompare(second.name, "ar");
  });
}
