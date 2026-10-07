import { messages } from "@/lib/i18n/messages";
import { MODONTY_LOGO_URL, STORY_PAGE_URL } from "./story-constants";

// Built per request, not at module load: the Organization now comes from Settings, so the
// series can only be assembled once that read resolves.
export function buildPodcastSeries(organization: Record<string, unknown>) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: messages.seo.story.podcastName,
    alternateName: "Modonty Story",
    url: STORY_PAGE_URL,
    description: messages.seo.story.podcastDescription,
    inLanguage: "ar",
    image: MODONTY_LOGO_URL,
    author: organization,
    publisher: organization,
    webFeed: STORY_PAGE_URL,
  };
}
