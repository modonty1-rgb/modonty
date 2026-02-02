"use client";

import { ArticleViewNavigation } from "./article-view-navigation";
import { useArticleView } from "./article-view-provider";

export function ArticleViewNavigationWrapper() {
  const { sections, activeSection, handleScrollToSection } = useArticleView();

  return (
    <ArticleViewNavigation
      sections={sections}
      activeSection={activeSection}
      onSectionClick={handleScrollToSection}
    />
  );
}
