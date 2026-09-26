import type { Metadata } from "next";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ComingSoon } from "@/components/shared/coming-soon/ComingSoon";
import { fill, messages } from "@/lib/i18n/messages";
import { IconLink } from "@/lib/icons";

/**
 * `/modo-link` — the Modo Link tile's final address, «قريباً» until Khalid defines the feature
 * (26 Sep 2026). Its own route, not `/modonty/<slug>`: it is a product, not a sector feed.
 */
const name = messages.modonty.sectors.modoLink;

export const metadata: Metadata = {
  title: fill(messages.modonty.soon.title, { name }),
  // A placeholder is thin content — kept out of the index until the real page replaces it.
  robots: { index: false, follow: true },
};

export default function ModoLinkPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "مدونتي", href: "/modonty" },
          { label: name },
        ]}
      />
      <ComingSoon name={name} blurb={messages.modonty.soon.blurbs.modoLink} icon={IconLink} />
    </>
  );
}
