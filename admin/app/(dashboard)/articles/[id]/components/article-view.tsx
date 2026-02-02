"use client";

import { useRef } from "react";
import { Article } from "../helpers/article-view-types";
import { useContentStats } from "../helpers/use-content-stats";
import { createSectionRefHandler } from "../helpers/scroll-utils";
import { ArticleViewHeader } from "./article-view-header";
import { ArticleViewFeaturedImage } from "./article-view-featured-image";
import { ArticleViewContent } from "./article-view-content";
import { ArticleViewFaqs } from "./article-view-faqs";
import { ArticleViewRelated } from "./article-view-related";
import { ArticleViewRelatedFrom } from "./article-view-related-from";
import { ArticleViewGallery } from "./article-view-gallery";
import { ArticleViewInfo } from "./article-view-info";
import { ArticleViewSeo } from "./article-view-seo";
import { ArticleViewSocial } from "./article-view-social";
import { ArticleViewStructuredData } from "./article-view-structured-data";
import { ArticleViewNextjsMetadata } from "./article-view-nextjs-metadata";

interface ArticleViewProps {
  article: Article;
  sectionRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>;
}

export function ArticleView({ article, sectionRefs }: ArticleViewProps) {
  const contentStats = useContentStats(article);

  const getSectionRef = (sectionId: string) => {
    return createSectionRefHandler(sectionRefs, sectionId);
  };

  return (
    <div className="space-y-8">
      <ArticleViewHeader article={article} />

      <ArticleViewFeaturedImage
        article={article}
        sectionRef={getSectionRef("section-featured-image")}
      />

      <div className="flex flex-col gap-6">
        <ArticleViewContent
          article={article}
          contentStats={contentStats}
          sectionRef={getSectionRef("section-content")}
        />

        <ArticleViewFaqs article={article} sectionRef={getSectionRef("section-faqs")} />

        <ArticleViewRelated
          article={article}
          sectionRef={getSectionRef("section-related")}
        />

        <ArticleViewRelatedFrom
          article={article}
          sectionRef={getSectionRef("section-related-from")}
        />

        <ArticleViewGallery
          article={article}
          sectionRef={getSectionRef("section-gallery")}
        />

        <ArticleViewInfo
          article={article}
          contentStats={contentStats}
          sectionRef={getSectionRef("section-info")}
        />

        <ArticleViewSeo article={article} sectionRef={getSectionRef("section-seo")} />

        <ArticleViewSocial
          article={article}
          sectionRef={getSectionRef("section-social")}
        />

        <ArticleViewStructuredData
          article={article}
          sectionRef={getSectionRef("section-structured-data")}
        />

        <ArticleViewNextjsMetadata
          article={article}
          sectionRef={getSectionRef("section-nextjs-metadata")}
        />
      </div>
    </div>
  );
}
