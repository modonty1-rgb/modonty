import storyManifest from "../../../../public/help/audio/general-pitch/manifest.json";

const STORY_TRANSCRIPT_IDS = new Set(["02", "03", "04"]);

/** The opening chapters as text, for whoever would rather read — or cannot play the audio. */
export const STORY_TRANSCRIPT = storyManifest.sections.flatMap((section) =>
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
