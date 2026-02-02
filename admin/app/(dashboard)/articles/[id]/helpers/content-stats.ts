import { ContentStats, Article } from "./article-view-types";
import { calculateWordCountImproved, detectArabicText } from "../../helpers/seo-helpers";

export function calculateContentStats(article: Article): ContentStats {
  if (typeof window === "undefined") {
    return {
      wordCount: article.wordCount || 0,
      characterCount: 0,
      characterCountNoSpaces: 0,
      paragraphCount: 0,
      headingCount: 0,
      linkCount: 0,
      imageCount: 0,
      listCount: 0,
      readingTime: article.readingTimeMinutes || 0,
      isArabic: false,
      countingMethod: "standard",
    };
  }

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = article.content;
  const textContent = tempDiv.textContent || tempDiv.innerText || "";
  const textWithoutSpaces = textContent.replace(/\s/g, "");

  const isArabic =
    detectArabicText(textContent) ||
    article.inLanguage === "ar" ||
    article.inLanguage === "arabic";
  const wordCount = calculateWordCountImproved(
    textContent,
    article.inLanguage || (isArabic ? "ar" : undefined)
  );

  const paragraphs = tempDiv.querySelectorAll("p").length;
  const headings = tempDiv.querySelectorAll("h1, h2, h3, h4, h5, h6").length;
  const links = tempDiv.querySelectorAll("a").length;
  const images = tempDiv.querySelectorAll("img").length;
  const lists = tempDiv.querySelectorAll("ul, ol").length;

  return {
    wordCount,
    characterCount: textContent.length,
    characterCountNoSpaces: textWithoutSpaces.length,
    paragraphCount: paragraphs,
    headingCount: headings,
    linkCount: links,
    imageCount: images,
    listCount: lists,
    readingTime: article.readingTimeMinutes || Math.ceil(wordCount / 200),
    isArabic,
    countingMethod: isArabic ? "arabic" : "standard",
  };
}
