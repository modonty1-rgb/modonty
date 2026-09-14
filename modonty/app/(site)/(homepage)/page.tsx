import { Metadata } from "next";
import { CachedHomePage } from "@/app/(site)/(homepage)/components/page-layout/CachedHomePage";
import { UserCard } from "@/components/shared/user-card/UserCard";
import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { getListingPageSeo } from "@/lib/seo/get-listing-page-seo";
import { SITE_URL } from "@/constants";
import { messages } from "@/lib/i18n/messages";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getListingPageSeo("home");
  const safeMetadata = metadata ?? {};
 
  const baseOpenGraph = (safeMetadata as { openGraph?: Record<string, unknown> }).openGraph ?? {};
 
  const storedTitle = (safeMetadata as { title?: unknown }).title;
  const title: Metadata["title"] =
    typeof storedTitle === "string" ? { absolute: storedTitle } : (storedTitle as Metadata["title"]);
  return {
    description: messages.seo.home.description,
    ...safeMetadata,
    ...(title ? { title } : {}),
    alternates: {
      ...(safeMetadata as { alternates?: object } | null)?.alternates,
      canonical: `${SITE_URL}/`,
     
      languages: buildHreflangLanguages(
        (await getPageSeoDefaults()).alternateLanguages,
        `${SITE_URL}/`,
        SITE_URL,
      ),
    },
    openGraph: {
      ...baseOpenGraph,
      url: `${SITE_URL}/`,
    },
  };
}


export default function HomePage() {
  return <CachedHomePage page={1} userCard={<UserCard />} />;
}
