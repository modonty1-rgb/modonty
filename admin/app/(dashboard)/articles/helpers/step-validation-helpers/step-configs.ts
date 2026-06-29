import type { StepConfig } from "./types";

export const STEP_CONFIGS: StepConfig[] = [
  {
    number: 1,
    label: "Basic",
    id: "basic",
    description: "Title, excerpt, client, category, author, tags, and SEO metadata",
    requiredFields: ["title", "slug", "clientId", "authorId", "seoTitle", "seoDescription"],
    optionalFields: ["categoryId", "tags", "citations", "semanticKeywords"],
  },
  {
    number: 2,
    label: "Content",
    id: "content",
    description: "Article content (rich-text editor + AI assistant)",
    requiredFields: ["content"],
    optionalFields: [
      "wordCount",
      "readingTimeMinutes",
      "contentDepth",
      "articleBodyText",
    ],
  },
  {
    number: 3,
    label: "Media",
    id: "media",
    description: "Cover image, audio version, and image gallery",
    requiredFields: [],
    optionalFields: ["featuredImageId", "audioUrl", "gallery"],
  },
  {
    number: 4,
    label: "FAQs",
    id: "faqs",
    description: "Frequently asked questions (FAQ Schema for Google rich results)",
    requiredFields: [],
    optionalFields: ["faqs"],
  },
  {
    number: 5,
    label: "Related",
    id: "related",
    description: "Related articles for internal linking and increased dwell time",
    requiredFields: [],
    optionalFields: ["relatedArticles"],
  },
];
