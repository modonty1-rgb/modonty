import type { Metadata } from "next";
import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";
import { StoryClientLoader } from "./StoryClientLoader";
import { STORY_OG_IMAGE as OG_IMAGE } from "./_constants";
import { getLegalEntity, buildOrganizationJsonLd } from "@/lib/seo/organization-jsonld";
import { toLegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getStoryPageForMetadata } from "./helpers/story-metadata";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { jsonLdHtml } from "@/lib/seo";
import storyManifest from "../../../public/help/audio/general-pitch/manifest.json";
import { SITE_URL } from "@/constants";
import { messages } from "@/lib/i18n/messages";

const PAGE_URL = `${SITE_URL}/story`;
const STORY_TRANSCRIPT_IDS = new Set(["02", "03", "04"]);
const STORY_TRANSCRIPT = storyManifest.sections.flatMap((section) =>
  STORY_TRANSCRIPT_IDS.has(section.id) && "text" in section
    ? [
        {
          id: section.id,
          title: section.label.split("—")[0].trim(),
          text: section.text,
        },
      ]
    : [],
);

// العنوان والوصف من صفّ الصفحة، يُحرَّران على `/modonty/pages/story`.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getStoryPageForMetadata(), {
    path: "/story",
    // لا احتياط للعنوان: صفّ `/story` يحمله (مقيس ٢٨ أغسطس — ١١ من ١١ صفّاً تحمل عنواناً)،
    // فالحذف لا يغيّر شيئاً اليوم ويجعل الفراغ غداً ظاهراً بدل أن يُغطّى بنصّ من الكود.
    // والوصف يبقى مؤقّتاً: هذا الصفّ **بلا وصف** اليوم، وحذفه يُسقط وسماً حيّاً.
    fallbackDescription: messages.seo.story.description,
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
    name: messages.seo.story.podcastName,
    alternateName: "Modonty Story",
    url: PAGE_URL,
    description: messages.seo.story.podcastDescription,
    inLanguage: "ar",
    image: OG_IMAGE,
    author: organization,
    publisher: organization,
    webFeed: PAGE_URL,
  };
}

export default async function StoryPage() {
  // The legal entity is one cached read shared with /trust — never a second constant.
  // الاسم يُقرأ هنا (سيرفر) ويُمرَّر — فلا يحمل باندل العميل ثابتاً ولا يقرأ القاعدة.
  const [entity, { siteName }] = await Promise.all([getLegalEntity(), getPageSeoDefaults()]);
  const ORGANIZATION = buildOrganizationJsonLd(entity);
  const PODCAST_SERIES = buildPodcastSeries(ORGANIZATION);

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: messages.seo.story.podcastName,
    description: messages.seo.story.episodeDescription,
    url: PAGE_URL,
    // اسم الموقع ولغته يعيشان في عقدة الهوية الواحدة — الإشارة إليها بـ`@id` بدل نسخِ
    // الاسم هنا، لأن النسخة الثانية تصير كياناً منافساً بمجرّد أن يتغيّر الاسم من الأدمن.
    isPartOf: { "@id": buildSiteEntityIds(SITE_URL).website },
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
        siteName={siteName}
      />
      <section
        aria-labelledby="story-transcript-heading"
        className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16"
        dir="rtl"
      >
        <h2
          id="story-transcript-heading"
          className="text-2xl font-extrabold text-foreground sm:text-3xl"
        >
          اقرأ قصة مدونتي
        </h2>
        <p className="mt-3 text-base leading-8 text-muted-foreground">
          النص المكتوب للمقاطع الافتتاحية من القصة الصوتية، لمن يفضّل القراءة أو
          لا يستطيع تشغيل الصوت.
        </p>
        <div className="mt-8 space-y-10">
          {STORY_TRANSCRIPT.map((section) => (
            <section key={section.id} aria-labelledby={`story-section-${section.id}`}>
              <h3
                id={`story-section-${section.id}`}
                className="text-xl font-bold text-foreground"
              >
                {section.title}
              </h3>
              <p className="mt-3 text-base leading-8 text-muted-foreground">
                {section.text}
              </p>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
