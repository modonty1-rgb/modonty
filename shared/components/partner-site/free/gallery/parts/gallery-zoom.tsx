"use client";

import dynamic from "next/dynamic";
import { useCallback, useState, type ReactNode } from "react";

import type { HomeData } from "../../home/home-data";

// Heavy viewer loaded ONLY on first click — zero JS in the initial visitor bundle.
const GalleryLightbox = dynamic(() => import("./gallery-lightbox").then((m) => m.GalleryLightbox), { ssr: false });

/**
 * Tiny client layer over the server-rendered album: one delegated click reads
 * `data-gallery-index` from the pressed thumbnail and opens the lazy viewer. The rows
 * themselves ship as static HTML — no per-thumbnail client JS.
 */
export function GalleryZoom({ images, children }: { images: HomeData["gallery"]; children: ReactNode }) {
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
        <GalleryLightbox images={images} index={openIndex} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
      )}
    </div>
  );
}
