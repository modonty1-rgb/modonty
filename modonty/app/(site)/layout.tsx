import type { ReactNode } from "react";
import { SiteShell } from "@/app/layout/components/SiteShell";

/**
 * Every modonty page (home, articles, partners list, users…) renders inside modonty's
 * header and footer. Kept free of any request-time read (cookies/headers) so the whole
 * site keeps its static shell — the header must stay in the prerendered HTML.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
