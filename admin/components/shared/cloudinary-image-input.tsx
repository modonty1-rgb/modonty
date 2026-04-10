"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, ImageIcon, CheckCircle2 } from "lucide-react";

interface CloudinaryImageInputProps {
  imageUrl: string;
  altText: string;
  onImageUrlChange: (url: string) => void;
  onAltTextChange: (alt: string) => void;
  onRemove: () => void;
}

function optimizeCloudinaryUrl(url: string): string {
  if (!url) return url;
  if (!url.includes("cloudinary.com") && !url.includes("res.cloudinary")) return url;

  // Already optimized
  if (url.includes("q_auto") && url.includes("f_auto")) return url;

  // Add transformations: w_1200,h_630 for OG image, q_auto,f_auto for performance
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;

  const before = url.substring(0, uploadIndex + 8);
  const after = url.substring(uploadIndex + 8);

  // Check if there are already transformations
  const hasTransformations = after.includes("/") && !after.startsWith("v");
  if (hasTransformations) {
    // Append to existing transformations
    const firstSlash = after.indexOf("/");
    const existingTransforms = after.substring(0, firstSlash);
    const rest = after.substring(firstSlash);

    const additions: string[] = [];
    if (!existingTransforms.includes("q_auto")) additions.push("q_auto");
    if (!existingTransforms.includes("f_auto")) additions.push("f_auto");
    if (!existingTransforms.includes("w_")) additions.push("w_1200");
    if (!existingTransforms.includes("h_")) additions.push("h_630");
    if (!existingTransforms.includes("c_")) additions.push("c_fill");

    if (additions.length === 0) return url;
    return `${before}${existingTransforms},${additions.join(",")}${rest}`;
  }

  // No transformations — add full set
  return `${before}w_1200,h_630,c_fill,q_auto,f_auto/${after}`;
}

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function CloudinaryImageInput({
  imageUrl,
  altText,
  onImageUrlChange,
  onAltTextChange,
  onRemove,
}: CloudinaryImageInputProps) {
  const [localUrl, setLocalUrl] = useState(imageUrl);
  const [showPreview, setShowPreview] = useState(!!imageUrl);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setLocalUrl(imageUrl);
    setShowPreview(!!imageUrl);
  }, [imageUrl]);

  const handleUrlBlur = () => {
    if (!localUrl.trim()) {
      onImageUrlChange("");
      setShowPreview(false);
      return;
    }

    const optimized = optimizeCloudinaryUrl(localUrl.trim());
    setLocalUrl(optimized);
    onImageUrlChange(optimized);
    setShowPreview(true);
    setImageError(false);
  };

  const isCloudinary = localUrl.includes("cloudinary");
  const isOptimized = localUrl.includes("q_auto") && localUrl.includes("f_auto");
  const isValid = isValidImageUrl(localUrl);

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <div>
        <Label className="text-xs">Image URL</Label>
        <div className="relative mt-1">
          <Input
            value={localUrl}
            onChange={(e) => setLocalUrl(e.target.value)}
            onBlur={handleUrlBlur}
            placeholder="https://res.cloudinary.com/..."
            className="pe-8 text-xs"
          />
          {localUrl && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute end-0 top-0 h-full w-8 text-muted-foreground hover:text-destructive"
              onClick={() => {
                setLocalUrl("");
                setShowPreview(false);
                onRemove();
              }}
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        {/* Status indicators */}
        {localUrl && (
          <div className="flex items-center gap-2 mt-1">
            {isCloudinary && isOptimized && (
              <span className="inline-flex items-center gap-1 text-[10px] text-green-600">
                <CheckCircle2 className="h-3 w-3" /> Optimized
              </span>
            )}
            {isCloudinary && !isOptimized && (
              <span className="text-[10px] text-yellow-600">
                Will auto-optimize on blur
              </span>
            )}
            {!isCloudinary && isValid && (
              <span className="text-[10px] text-muted-foreground">
                External URL (no auto-optimization)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Alt Text */}
      <div>
        <Label className="text-xs">Alt Text</Label>
        <Input
          value={altText}
          onChange={(e) => onAltTextChange(e.target.value)}
          placeholder="Describe the image…"
          className="mt-1 text-xs"
        />
      </div>

      {/* Preview */}
      {showPreview && isValid && !imageError && (
        <div className="relative border rounded-lg overflow-hidden bg-muted/30 aspect-video">
          <Image
            src={localUrl}
            alt={altText || "Preview"}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 400px"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {showPreview && imageError && (
        <div className="flex items-center justify-center gap-2 p-4 border rounded-lg bg-muted/30 text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span className="text-xs">Failed to load image preview</span>
        </div>
      )}

      {!showPreview && !localUrl && (
        <div className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span className="text-xs">Paste a Cloudinary URL above</span>
        </div>
      )}
    </div>
  );
}
