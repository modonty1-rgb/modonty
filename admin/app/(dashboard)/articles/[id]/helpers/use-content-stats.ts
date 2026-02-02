import { useEffect, useState } from "react";
import { ContentStats, Article } from "./article-view-types";
import { calculateContentStats } from "./content-stats";

export function useContentStats(article: Article) {
  const [contentStats, setContentStats] = useState<ContentStats>({
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
  });

  useEffect(() => {
    const stats = calculateContentStats(article);
    setContentStats(stats);
  }, [article.content, article.wordCount, article.readingTimeMinutes, article.inLanguage]);

  return contentStats;
}
