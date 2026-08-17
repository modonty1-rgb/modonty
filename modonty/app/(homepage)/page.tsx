import { Metadata } from "next";
import { CachedHomePage } from "@/app/(homepage)/components/page-layout/CachedHomePage";
import { UserCard } from "@/components/shared/user-card/UserCard";
import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { getListingPageSeo } from "@/lib/seo/get-listing-page-seo";
import { SITE_URL, BRAND_AR } from "@/constants";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getListingPageSeo("home");
  const safeMetadata = metadata ?? {};
  // Mariam audit 2026-05-27: homepage og:url was https://modonty.com (no www) from DB
  // Settings.homeMetaTags column — mismatched the canonical (www). Force override here so
  // www-only canonical is honored across all metadata fields until DB row is updated.
  const baseOpenGraph = (safeMetadata as { openGraph?: Record<string, unknown> }).openGraph ?? {};
  // Admin-stored title already ends with the brand; wrap in `absolute` so the root
  // layout's `%s | مدونتي` template doesn't append it a second time. Same fix the
  // listing pages carry — the homepage was missed because its title comes from
  // Settings, not from the shared builder.
  const storedTitle = (safeMetadata as { title?: unknown }).title;
  const title: Metadata["title"] =
    typeof storedTitle === "string" ? { absolute: storedTitle } : (storedTitle as Metadata["title"]);
  return {
    description: `${BRAND_AR} — منصة المحتوى العربي المتخصصة. اكتشف مقالات في التقنية والأعمال والتسويق والسياحة والأزياء من أبرز الكتّاب والخبراء العرب.`,
    ...safeMetadata,
    ...(title ? { title } : {}),
    alternates: {
      ...(safeMetadata as { alternates?: object } | null)?.alternates,
      canonical: `${SITE_URL}/`,
      // Mariam audit: Next.js replaces `alternates` entirely from generateMetadata —
      // inherited languages from layout.tsx get lost. Must re-declare here. The list itself
      // comes from Settings: this block used to spell out four locales while Settings held
      // nine, so the homepage — the page Google crawls most — declared the fewest markets.
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

// Uncached on purpose. UserCard reads the session cookie, which "use cache" forbids
// inside its scope — so the element is created out here and handed to the cached page
// as a pass-through slot. The cached shell never introspects it, so the cache entry is
// unaffected and only the card renders per request (use-cache.md, "Interleaving").
export default function HomePage() {
  return <CachedHomePage page={1} userCard={<UserCard />} />;
}
