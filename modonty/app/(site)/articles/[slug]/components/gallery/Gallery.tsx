"use client";

import { useState } from "react";
import { OptimizedImage, type ImageMedia } from "@modonty/shared/components/optimized-image";

import { Card } from "@/components/ui/card";
import { IconImage } from "@/lib/icons";

interface GalleryImage {
  /** The media ROW, not a resolved url — the component resolves src + blur itself.
   *  This used to be `url: string` produced by `mediaSrc()` in page.tsx, which threw
   *  the stored placeholder away before the component could ever see it. */
  media: ImageMedia;
  alt: string;
  caption?: string | null;
}

interface GalleryProps {
  images: GalleryImage[];
  /** Shown instead of the gallery when the article has no images. */
  fallbackText?: string | null;
  clientName?: string | null;
}

// RULE (agreed 2026-06-03): large in-card preview + thumbnails. Clicking a
// thumbnail enlarges it INTO the preview above (swap). NO lightbox / no fullscreen.
export function Gallery({ images, fallbackText, clientName }: GalleryProps) {
  const count = images.length;
  const [active, setActive] = useState(0);

  // Fallback — no images → client blurb (agreed design)
  if (count === 0) {
    if (!fallbackText?.trim()) return null;
    return (
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground">
          <IconImage className="h-4 w-4" />
          عن {clientName || "العميل"}
        </div>
        <p className="p-4 text-sm leading-relaxed text-muted-foreground">{fallbackText}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground">
        <IconImage className="h-4 w-4" />
        معرض صور المقال
      </div>

      <div className="p-3">
        {/* large in-card preview (no lightbox) */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <OptimizedImage media={images[active].media} alt={images[active].alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 280px" />
        </div>

        {images[active].caption && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{images[active].caption}</p>
        )}

        {count > 1 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {images.map((img, i) => (
              <button
                key={(img.media.bunnyUrl ?? img.media.url ?? "") + i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`صورة ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                className={`relative aspect-video w-[56px] shrink-0 overflow-hidden rounded-md bg-muted transition-opacity ${
                  i === active ? "opacity-100 ring-2 ring-primary" : "opacity-60 hover:opacity-90"
                }`}
              >
                <OptimizedImage media={img.media} alt={img.alt} fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="px-3 pb-3 text-[11px] text-muted-foreground">{count} صور · اضغط مصغّرة للتكبير</p>
    </Card>
  );
}
