"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MediaPickerDialog } from "@/components/shared/media-picker-dialog";
import { ThumbnailImageView } from "@/components/shared/thumbnail-image-view";
import { Plus, Image as ImageIcon } from "lucide-react";
import type { GalleryFormItem } from "@/lib/types/form-types";

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

    // Check max limit
    if (gallery.length >= maxImages) {
      return;
    }

    // Calculate next position
    const maxPosition = gallery.length > 0 
      ? Math.max(...gallery.map(item => item.position))
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
        filename: media.url.split('/').pop() || 'image.jpg',
      },
    };

    onGalleryChange([...gallery, newItem]);
    setMediaPickerOpen(false);
  };

  const handleRemoveImage = (mediaId: string) => {
    const newGallery = gallery
      .filter(item => item.mediaId !== mediaId)
      .map((item, index) => ({ ...item, position: index }));
    onGalleryChange(newGallery);
  };

  const isDisabled = disabled || !clientId;
  const isMaxReached = gallery.length >= maxImages;

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Image Gallery</Label>
          <p className="text-xs text-muted-foreground mt-1">
            {gallery.length}/{maxImages} images {isMaxReached && '(Maximum reached)'}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setMediaPickerOpen(true)}
          disabled={isDisabled || isMaxReached}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      {/* Empty State */}
      {gallery.length === 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setMediaPickerOpen(true)}
          disabled={isDisabled}
          className="w-full"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Add First Image
        </Button>
      )}

      {/* Gallery List using ThumbnailImageView */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gallery.map((item) => {
            if (!item.media?.url) {
              return null;
            }

            return (
              <ThumbnailImageView
                key={item.mediaId}
                imageUrl={item.media.url}
                altText={item.altText || item.media.altText || undefined}
                filename={item.media.filename}
                width={item.media.width || undefined}
                height={item.media.height || undefined}
                cloudinaryPublicId={undefined}
                cloudinaryVersion={undefined}
                onRemove={() => handleRemoveImage(item.mediaId)}
                showRemove={true}
                showChange={false}
                aspectRatio="video"
                thumbnailSize="md"
                fullWidth={true}
                buttonSize="default"
              />
            );
          })}
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
