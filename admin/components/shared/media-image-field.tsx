"use client";

import { useState } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, ImageIcon, Library } from "lucide-react";
import { MediaPickerDialog } from "@/components/shared/media-picker-dialog";
import type { MediaScope } from "@prisma/client";

interface MediaImageFieldProps {
  label?: string;
  imageUrl: string;
  altText: string;
  onImageChange: (url: string, alt: string) => void;
  onRemove: () => void;
  scope?: MediaScope | "client";
  clientId?: string | null;
}

export function MediaImageField({
  label = "Image",
  imageUrl,
  altText,
  onImageChange,
  onRemove,
  scope = "PLATFORM",
  clientId = null,
}: MediaImageFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-3">
      <Label className="text-xs">{label}</Label>

      {imageUrl ? (
        <div className="space-y-2">
          <div className="relative border rounded-lg overflow-hidden bg-muted/30 aspect-video group">
            <Image
              src={imageUrl}
              alt={altText || label}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 end-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onRemove}
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          {altText && (
            <p className="text-[10px] text-muted-foreground truncate">{altText}</p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={() => setPickerOpen(true)}
          >
            <Library className="h-3.5 w-3.5" />
            Change Image
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          <ImageIcon className="h-6 w-6" />
          <span className="text-xs">Pick from Media Library</span>
        </button>
      )}

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        clientId={clientId}
        defaultScope={scope}
        onSelect={(media) => {
          onImageChange(media.url, media.altText || "");
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
