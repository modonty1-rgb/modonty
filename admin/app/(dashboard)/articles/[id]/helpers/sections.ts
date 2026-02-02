import {
  Image as ImageIcon,
  FileText,
  HelpCircle,
  Layers,
  Search,
  Share2,
  Code,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { Article, Section } from "./article-view-types";

export function getArticleSections(article: Article): Section[] {
  const sections: Section[] = [
    {
      id: "section-featured-image",
      label: "Featured Image",
      icon: ImageIcon,
      condition: !!article.featuredImage,
    },
    {
      id: "section-content",
      label: "Content",
      icon: FileText,
      condition: true,
    },
    {
      id: "section-faqs",
      label: "FAQs",
      icon: HelpCircle,
      condition: !!(article.faqs && article.faqs.length > 0),
    },
    {
      id: "section-related",
      label: "Related (Outgoing)",
      icon: Layers,
      condition: true,
    },
    {
      id: "section-related-from",
      label: "Related (Incoming)",
      icon: ArrowLeft,
      condition: true,
    },
    {
      id: "section-gallery",
      label: "Gallery",
      icon: ImageIcon,
      condition: !!(article.gallery && article.gallery.length > 0),
    },
    {
      id: "section-info",
      label: "Article Info",
      icon: FileText,
      condition: true,
    },
    {
      id: "section-seo",
      label: "SEO",
      icon: Search,
      condition: true,
    },
    {
      id: "section-social",
      label: "Social & Protocols",
      icon: Share2,
      condition: true,
    },
    {
      id: "section-structured-data",
      label: "JSON-LD",
      icon: Code,
      condition: true,
    },
    {
      id: "section-nextjs-metadata",
      label: "Metadata",
      icon: Settings,
      condition: true,
    },
  ];

  return sections.filter((section) => section.condition);
}
