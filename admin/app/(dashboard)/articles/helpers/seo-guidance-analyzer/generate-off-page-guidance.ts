import type { ArticleFormData } from "@/lib/types/form-types";
import type { OffPageRecommendation } from "./types";

export function generateOffPageGuidance(formData: ArticleFormData): OffPageRecommendation[] {
  const recommendations: OffPageRecommendation[] = [];

  if (formData.relatedArticles && formData.relatedArticles.length > 0) {
    recommendations.push({
      id: "internal-linking-opportunities",
      category: "link-building",
      title: "Internal Linking Opportunities",
      description: `You have ${formData.relatedArticles.length} related article(s). Consider adding more internal links within the content.`,
      actionable: true,
      steps: [
        "Review related articles and identify natural linking opportunities",
        "Add contextual internal links within the article content",
        "Link to related articles in the conclusion or related sections",
      ],
      priority: "high",
    });
  } else {
    recommendations.push({
      id: "add-related-articles",
      category: "link-building",
      title: "Add Related Articles",
      description:
        "No related articles set. Adding related articles helps with internal linking and user engagement.",
      actionable: true,
      steps: [
        "Go to Related step and select 3-5 related articles",
        "Use relationship types: related, similar, or recommended",
        "This helps with internal linking and keeps users on your site",
      ],
      priority: "medium",
    });
  }

  if (formData.ogArticleAuthor) {
    recommendations.push({
      id: "social-author-signal",
      category: "social-signals",
      title: "Author Social Profile",
      description: "Article author is set. Consider linking to author social profiles in structured data.",
      actionable: true,
      steps: [
        "Ensure author has social profiles (Twitter, LinkedIn)",
        "Add social profile URLs to author schema",
        "This helps with E-E-A-T signals",
      ],
      priority: "medium",
    });
  }

  recommendations.push({
    id: "content-distribution",
    category: "content-distribution",
    title: "Content Distribution Strategy",
    description: "Plan content distribution across multiple channels for maximum reach.",
    actionable: true,
    steps: [
      "Share on social media platforms (Twitter, LinkedIn, Facebook)",
      "Include in email newsletter if applicable",
      "Submit to relevant industry publications",
      "Engage with community forums and discussions",
    ],
    priority: "high",
  });

  if (formData.citations && formData.citations.length > 0) {
    recommendations.push({
      id: "citations-present",
      category: "authority-building",
      title: "Citations & Sources",
      description: `Article has ${formData.citations.length} citation(s). Citations help build authority and trust.`,
      actionable: false,
      steps: [],
      priority: "low",
    });
  } else {
    recommendations.push({
      id: "add-citations",
      category: "authority-building",
      title: "Add Citations & Sources",
      description:
        "Adding citations and sources helps build E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).",
      actionable: true,
      steps: [
        "Add citations to authoritative sources",
        "Link to original research or studies",
        "Cite industry experts and publications",
        "This helps Google understand content credibility",
      ],
      priority: "medium",
    });
  }

  return recommendations;
}

