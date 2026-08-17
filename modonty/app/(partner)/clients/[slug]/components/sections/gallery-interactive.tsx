"use client";

import dynamic from "next/dynamic";
import { useCallback, useState, type ReactNode } from "react";

import type { ClientGalleryImage } from "./gallery-lightbox-overlay";

// Heavy viewer loaded ONLY on first click — zero JS in the initial visitor bundle.
const GalleryLightboxOverlay = dynamic(
  () => import("./gallery-lightbox-overlay").then((m) => m.GalleryLightboxOverlay),
  { ssr: false }
);

interface Props {
  images: ClientGalleryImage[];
  /** Server-rendered thumbnail grid (stays in HTML for SEO/LCP). */
  children: ReactNode;
}

/**
 * Tiny client layer over the server-rendered «معرض الأعمال» grid: one delegated
 * click reads `data-gallery-index` from the pressed thumbnail and opens the lazy
 * lightbox. The grid itself ships as static HTML — no per-thumbnail client JS.
 */
export function GalleryInteractive({ images, children }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const onClick = useCallback((e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-gallery-index]");
    if (!el) return;
    const i = Number(el.dataset.galleryIndex);
    if (!Number.isNaN(i)) setOpenIndex(i);
  }, []);

  return (
    <div onClick={onClick}>
      {children}
      {openIndex !== null && (
        <GalleryLightboxOverlay
          images={images}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}
