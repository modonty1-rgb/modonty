import { SITE_URL } from "@/constants";

/** The absolute URL of one page of `/modonty` — for `<link rel="prev">` / `<link rel="next">`. */
export function pageUrl(target: number): string {
  return target > 1 ? `${SITE_URL}/modonty?page=${target}` : `${SITE_URL}/modonty`;
}
