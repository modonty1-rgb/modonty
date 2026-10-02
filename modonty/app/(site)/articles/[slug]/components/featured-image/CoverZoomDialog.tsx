"use client";

import { OptimizedImage, type ImageMedia } from "@modonty/shared/components/optimized-image";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CoverZoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: ImageMedia;
  alt: string;
}

/**
 * The cover, large. Loaded only when a reader taps the cover (see CoverZoom) — none of this is in
 * the article's first load. `object-contain` at the image's own ratio: the whole picture, never a
 * crop of it, which is what a reader who taps an image is asking for.
 */
export function CoverZoomDialog({ open, onOpenChange, media, alt }: CoverZoomDialogProps) {
  const ratio = media.width && media.height ? media.width / media.height : 16 / 9;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Sized by the SCREEN, not the dialog: width is the smallest of the screen width, 85% of
          the screen height × the image's ratio, and 1024px — so the whole picture and the close
          button always fit. Measured 2 Oct at 1280×495: a full-width 1024×576 box cut the top
          and bottom off and pushed the close button out of view. The close button gets a dark
          backing because it now sits on the picture itself. */}
      <DialogContent className="w-fit max-w-none gap-0 border-0 bg-black p-0 [&>button]:bg-black/60 [&>button]:text-white [&>button]:opacity-100">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div
          className="relative overflow-hidden rounded-lg"
          style={{ aspectRatio: ratio, width: `min(calc(100vw - 2rem), calc(85vh * ${ratio}), 1024px)` }}
        >
          <OptimizedImage media={media} alt={alt} fill className="object-contain" sizes="(min-width: 1024px) 1024px, 100vw" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
