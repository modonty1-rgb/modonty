import { permanentRedirect } from "next/navigation";

/**
 * Social links moved onto the /accounts page editor (Khalid, 2026-09-23) — that page is the
 * list of these accounts. This URL only forwards, so a bookmark or an old link still lands
 * on the one place they are edited.
 */
export default function SocialLinksMovedPage() {
  permanentRedirect("/modonty/pages/accounts");
}
