"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import { Article } from "../helpers/article-view-types";
import { CopyableId } from "./shared/copyable-id";

import { mediaSrc } from "@modonty/database/lib/media-src";
import { justifyRows, tileAspectRatio, shouldContainTile } from "@modonty/database/lib/justify-rows";

/** Card content width at the widest breakpoint. Only decides tiles-per-row — flex-grow
 *  fills the actual width exactly. See the `gallery-justified-rows` standard. */
const GALLERY_WIDTH = 760;

interface ArticleViewGalleryProps {
  article: Article;
  sectionRef?: (el: HTMLElement | null) => void;
}

export function ArticleViewGallery({ article, sectionRef }: ArticleViewGalleryProps) {
  if (!article.gallery || article.gallery.length === 0) return null;

  return (
    <Card ref={sectionRef} className="scroll-mt-20">
      <CardHeader className="text-right" dir="rtl">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-right flex-1">Media Gallery</CardTitle>
        </div>
      </CardHeader>
      <CardContent dir="rtl">
        {justifyRows(
          article.gallery.filter((g) => g.media).map((g) => ({ ...g, ...g.media! })),
          GALLERY_WIDTH,
        ).map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-3 mb-3">
            {row.items.map(({ tile: item, grow }) =>
              item.media ? (
              <div
                key={item.id}
                style={
                  row.isLast
                    ? { flex: "0 0 auto", width: `${row.height * grow}px` }
                    : { flexGrow: grow, flexBasis: 0, minWidth: 0 }
                }
                className="relative overflow-hidden rounded-lg border bg-muted/30 group cursor-pointer"
              >
                <div style={{ aspectRatio: tileAspectRatio(item) }} className="relative">
                <Image
                  src={mediaSrc(item.media) ?? item.media.url}
                  alt={item.media.altText || ""}
                  fill
                  className={`${shouldContainTile(item) ? "object-contain" : "object-cover"} transition-transform group-hover:scale-105`}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                </div>
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
              ) : null,
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
