"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ImageMedia } from "@modonty/shared/components/optimized-image";

import { clarityEvent } from "@/lib/analytics/clarity";
import { IconSearch } from "@/lib/icons";

// The dialog and its large image download on the first tap, never with the article.
const CoverZoomDialog = dynamic(() => import("./CoverZoomDialog").then((m) => ({ default: m.CoverZoomDialog })), {
  ssr: false,
});

/**
 * Makes the cover answer a tap. Plan هـ٣ (2 Oct 2026): Clarity measured 49% of phone clicks and
 * 62% of desktop clicks on the article page landing on the cover — and nothing happened. Now the
 * cover opens large.
 *
 * A transparent button laid over the server-rendered image, so the image itself (the page's LCP)
 * stays out of the client bundle. The small magnifier tells a reader the cover can be opened
 * before they try. `cover_zoom` lets Clarity count how many do.
 */
export function CoverZoom({ media, alt }: { media: ImageMedia; alt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          clarityEvent("cover_zoom");
        }}
        className="absolute inset-0 z-10 cursor-zoom-in rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="تكبير صورة الغلاف"
      >
        <span className="absolute bottom-2 end-2 grid size-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm" aria-hidden>
          <IconSearch className="size-4" />
        </span>
      </button>
      {open && <CoverZoomDialog open={open} onOpenChange={setOpen} media={media} alt={alt} />}
    </>
  );
}
