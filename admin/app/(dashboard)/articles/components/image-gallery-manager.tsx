"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaPickerDialog } from "@/components/shared/media-picker-dialog";
import { Plus, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryFormItem } from "@/lib/types/form-types";
import { ImageSeoStrip } from "./image-seo-strip";

interface ImageGalleryManagerProps {
  clientId: string | null;
  gallery: GalleryFormItem[];
  onGalleryChange: (gallery: GalleryFormItem[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

const MAX_IMAGES = 10;

export function ImageGalleryManager({
  clientId,
  gallery = [],
  onGalleryChange,
  disabled = false,
  maxImages = MAX_IMAGES,
}: ImageGalleryManagerProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const handleAddImage = (media: {
    url: string;
    altText: string | null;
    mediaId: string;
    width?: number | null;
    height?: number | null;
  }) => {
    if (!media.mediaId) return;
    if (gallery.length >= maxImages) return;

    const maxPosition =
      gallery.length > 0
        ? Math.max(...gallery.map((item) => item.position))
        : -1;

    const newItem: GalleryFormItem = {
      mediaId: media.mediaId,
      position: maxPosition + 1,
      caption: null,
      altText: null,
      media: {
        id: media.mediaId,
        url: media.url,
        altText: media.altText || null,
        width: media.width || null,
        height: media.height || null,
        filename: media.url.split("/").pop() || "image.jpg",
      },
    };

    onGalleryChange([...gallery, newItem]);
    setMediaPickerOpen(false);
  };

  const handleRemoveImage = (mediaId: string) => {
    const newGallery = gallery
      .filter((item) => item.mediaId !== mediaId)
      .map((item, index) => ({ ...item, position: index }));
    onGalleryChange(newGallery);
  };

  // After a filename rename the Cloudinary URL changes — refresh the thumbnail's URL so it
  // doesn't 404 (the media record is already updated server-side; this keeps the form display fresh).
  const handleUrlChange = (mediaId: string, url: string) => {
    onGalleryChange(
      gallery.map((item) =>
        item.mediaId === mediaId && item.media
          ? { ...item, media: { ...item.media, url } }
          : item,
      ),
    );
  };

  const isDisabled = disabled || !clientId;
  const isMaxReached = gallery.length >= maxImages;
  const isEmpty = gallery.length === 0;

  return (
    <div className="space-y-3">
      {/* Counter Badge */}
      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className={cn(
            "font-mono text-xs tabular-nums",
            isMaxReached && "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
          )}
        >
          {gallery.length} / {maxImages}
          {isMaxReached && " · مكتمل"}
        </Badge>
        {!isEmpty && !isMaxReached && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMediaPickerOpen(true)}
            disabled={isDisabled}
            className="h-8 gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="text-xs">إضافة صورة</span>
          </Button>
        )}
      </div>

      {/* Empty State — Drop Zone */}
      {isEmpty ? (
        <button
          type="button"
          onClick={() => setMediaPickerOpen(true)}
          disabled={isDisabled}
          className={cn(
            "group flex flex-col items-center justify-center w-full text-center py-12 px-6 rounded-lg border-2 border-dashed transition-colors",
            isDisabled
              ? "border-border bg-muted/20 cursor-not-allowed opacity-60"
              : "border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 cursor-pointer",
          )}
        >
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3 transition-colors",
            !isDisabled && "group-hover:bg-primary/15",
          )}>
            <ImagePlus className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">إضافة صور للمعرض</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            حتى {maxImages} صور — تظهر داخل المقال كـ carousel/grid
          </p>
        </button>
      ) : (
        /* Column — each image gets the cover-style treatment: image + full SEO beside it. */
        <div className="space-y-4">
          {gallery.map((item, index) => {
            if (!item.media?.url) return null;
            return (
              <div
                key={item.mediaId}
                className="grid gap-6 rounded-lg border p-4 md:grid-cols-2 md:items-stretch"
              >
                {/* Image */}
                <div className="group relative aspect-video overflow-hidden rounded-md border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.media.url}
                    alt={item.altText || item.media.altText || ""}
                    className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute top-1.5 start-1.5 z-10 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-background/90 px-1.5 text-[10px] font-bold tabular-nums text-foreground shadow-sm backdrop-blur-sm">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(item.mediaId)}
                    aria-label="حذف من المعرض"
                    className="absolute top-1.5 end-1.5 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-destructive/95 text-destructive-foreground opacity-0 shadow-md transition-opacity hover:bg-destructive group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Full SEO (score + gaps + edit dialog + read-only breakdown) */}
                <ImageSeoStrip
                  mediaId={item.mediaId}
                  showBreakdown
                  onChange={(url) => url && handleUrlChange(item.mediaId, url)}
                />
              </div>
            );
          })}

          {/* Add more (until max reached) */}
          {!isMaxReached && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setMediaPickerOpen(true)}
              disabled={isDisabled}
              className="h-11 w-full gap-2 border-dashed"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">إضافة صورة للمعرض</span>
            </Button>
          )}
        </div>
      )}

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        clientId={clientId}
        onSelect={handleAddImage}
      />
    </div>
  );
}
