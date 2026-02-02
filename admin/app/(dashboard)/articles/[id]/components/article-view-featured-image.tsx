"use client";

import { Card } from "@/components/ui/card";
import { Article } from "../helpers/article-view-types";
import { CopyableId } from "./shared/copyable-id";
import { FieldLabel } from "./shared/field-label";

interface ArticleViewFeaturedImageProps {
  article: Article;
  sectionRef: (el: HTMLElement | null) => void;
}

export function ArticleViewFeaturedImage({
  article,
  sectionRef,
}: ArticleViewFeaturedImageProps) {
  if (!article.featuredImage) return null;

  return (
    <Card
      id="section-featured-image"
      ref={sectionRef}
      className="overflow-hidden scroll-mt-20"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img
          src={article.featuredImage.url}
          alt={article.featuredImage.altText || article.title}
          className="h-full w-full object-cover"
        />
        {article.featuredImage.altText && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-white text-sm text-right" dir="rtl">
            <div className="flex items-center justify-between gap-4">
              <span>{article.featuredImage.altText}</span>
              <div className="flex items-center gap-2">
                <FieldLabel
                  label=""
                  fieldPath="article.featuredImage"
                  fieldType="Media?"
                  idValue={article.featuredImage.id}
                  idLabel="Featured Image ID"
                />
                <CopyableId id={article.featuredImage.id} label="Featured Image" />
              </div>
            </div>
          </div>
        )}
        {!article.featuredImage.altText && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <FieldLabel
              label=""
              fieldPath="article.featuredImage"
              fieldType="Media?"
              idValue={article.featuredImage.id}
              idLabel="Featured Image ID"
            />
            <CopyableId id={article.featuredImage.id} label="Featured Image" />
          </div>
        )}
      </div>
    </Card>
  );
}
