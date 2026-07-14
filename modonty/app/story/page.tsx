import type { Metadata } from "next";
import { StoryClientLoader } from "./StoryClientLoader";
import { STORY_OG_IMAGE as OG_IMAGE } from "./_constants";
import { ORGANIZATION_JSONLD as ORGANIZATION } from "@/lib/organization-jsonld";
import { jsonLdHtml } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
const PAGE_URL = `${SITE_URL}/story`;

export const metadata: Metadata = {
  title: "قصة مدونتي — البنيان الرقمي للعالم العربي",
  description:
    "اسمع قصة مدونتي بصوت احترافي: كيف نبني منظومة رقمية كاملة لكل نشاط عربي — من نقطة الشعار حتى البنيان المرصوص.",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      "ar-SA": PAGE_URL,
      "ar-EG": PAGE_URL,
    },
  },
  openGraph: {
    title: "قصة مدونتي — البنيان الرقمي للعالم العربي",
    description:
      "اسمع قصة مدونتي بصوت احترافي. منظومة رقمية كاملة لكل نشاط عربي.",
    url: PAGE_URL,
    type: "article",
    locale: "ar_SA",
    siteName: "مدونتي",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "مدونتي" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "قصة مدونتي — البنيان الرقمي للعالم العربي",
    description: "اسمع قصة مدونتي بصوت احترافي.",
    images: [OG_IMAGE],
  },
};

// Organization schema now comes from the shared canonical builder (@/lib/organization-jsonld)
// so /story and /trust never drift. Verified legal data lives in @/lib/brand → LEGAL.

const PODCAST_SERIES = {
  "@context": "https://schema.org",
  "@type": "PodcastSeries",
  name: "قصة مدونتي — البنيان الرقمي للعالم العربي",
  alternateName: "Modonty Story",
  url: PAGE_URL,
  description:
    "بودكاست قصير (٥ دقائق) يشرح فلسفة مدونتي، الفرق بيننا وبين الوكالات والفريلانسرز، وكيف نساهم في رؤية المملكة ٢٠٣٠.",
  inLanguage: "ar",
  image: OG_IMAGE,
  author: ORGANIZATION,
  publisher: ORGANIZATION,
  webFeed: PAGE_URL,
} as const;

export default function StoryPage() {
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
      />
    </>
  );
}
