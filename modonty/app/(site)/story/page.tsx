import type { Metadata } from "next";
import { StoryClientLoader } from "./StoryClientLoader";
import { STORY_OG_IMAGE as OG_IMAGE } from "./_constants";
import { getLegalEntity, buildOrganizationJsonLd } from "@/lib/seo/organization-jsonld";
import { toLegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getStoryPageForMetadata } from "./helpers/story-metadata";
import { jsonLdHtml } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
const PAGE_URL = `${SITE_URL}/story`;

// Title and description come from the page's own row, edited at /modonty/pages/story.
// The constants below stay as the fallback for a row that does not exist yet — an indexed
// page must never ship with an empty title while someone fills a form.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getStoryPageForMetadata(), {
    path: "/story",
    fallbackTitle: "قصة مدونتي — البنيان الرقمي للعالم العربي",
    fallbackDescription:
      "اسمع قصة مدونتي بصوت احترافي: كيف نبني منظومة رقمية كاملة لكل نشاط عربي — من نقطة الشعار حتى البنيان المرصوص.",
  });
}

// Organization schema now comes from the shared canonical builder (@/lib/seo/organization-jsonld)
// so /story and /trust never drift. The entity itself is read from Settings — the same row
// feeds both the markup below and the trust strip inside the client component.

// Built per request, not at module load: the Organization now comes from Settings, so the
// series can only be assembled once that read resolves.
function buildPodcastSeries(organization: Record<string, unknown>) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: "قصة مدونتي — البنيان الرقمي للعالم العربي",
    alternateName: "Modonty Story",
    url: PAGE_URL,
    description:
      "بودكاست قصير (٥ دقائق) يشرح فلسفة مدونتي، الفرق بيننا وبين الوكالات والفريلانسرز، وكيف نساهم في رؤية المملكة ٢٠٣٠.",
    inLanguage: "ar",
    image: OG_IMAGE,
    author: organization,
    publisher: organization,
    webFeed: PAGE_URL,
  };
}

export default async function StoryPage() {
  // The legal entity is one cached read shared with /trust — never a second constant.
  const entity = await getLegalEntity();
  const ORGANIZATION = buildOrganizationJsonLd(entity);
  const PODCAST_SERIES = buildPodcastSeries(ORGANIZATION);

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "قصة مدونتي — البنيان الرقمي للعالم العربي",
    description:
      "اسمع قصة مدونتي بصوت احترافي: كيف نبني منظومة رقمية كاملة لكل نشاط عربي.",
    url: PAGE_URL,
    inLanguage: "ar",
    isPartOf: { "@type": "WebSite", name: "مدونتي", url: SITE_URL },
    publisher: ORGANIZATION,
    mainEntity: PODCAST_SERIES,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(ORGANIZATION) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(PODCAST_SERIES) }}
      />
      <StoryClientLoader
        manifestUrl="/help/audio/general-pitch/manifest.json"
        audioBase="/help/audio/general-pitch"
        legal={toLegalEntityDisplay(entity)}
      />
    </>
  );
}
