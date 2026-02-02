"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import { Article } from "../helpers/article-view-types";
import { FieldLabel } from "./shared/field-label";
import { CopyableId } from "./shared/copyable-id";

interface ArticleViewGalleryProps {
  article: Article;
  sectionRef: (el: HTMLElement | null) => void;
}

export function ArticleViewGallery({ article, sectionRef }: ArticleViewGalleryProps) {
  if (!article.gallery || article.gallery.length === 0) return null;

  return (
    <Card id="section-gallery" ref={sectionRef} className="scroll-mt-20">
      <CardHeader className="text-right" dir="rtl">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-right flex-1">Media Gallery</CardTitle>
          <FieldLabel
            label=""
            fieldPath="article.gallery"
            fieldType="ArticleMedia[]"
          />
        </div>
      </CardHeader>
      <CardContent dir="rtl">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {article.gallery.map((item) =>
            item.media ? (
              <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg border bg-muted/30 group cursor-pointer">
                <img
                  src={item.media.url}
                  alt={item.media.altText || ""}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                {item.media.altText && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-xs text-right" dir="rtl">
                    <div className="flex items-center justify-between gap-2">
                      <span className="line-clamp-1">{item.media.altText}</span>
                      <CopyableId id={item.media.id} label="Media" />
                    </div>
                  </div>
                )}
                {!item.media.altText && (
                  <div className="absolute bottom-2 left-2">
                    <CopyableId id={item.media.id} label="Media" />
                  </div>
                )}
              </div>
            ) : null
          )}
        </div>
      </CardContent>
    </Card>
  );
}
