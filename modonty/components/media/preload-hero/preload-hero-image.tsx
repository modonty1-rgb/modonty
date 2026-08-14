"use client";

import { getImageProps } from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  DEFAULT_IMAGE_QUALITY,
  SIZE_PRESETS,
  type SizePreset,
} from "@modonty/shared/components/optimized-image";

/**
 * Downloads a DETAIL page's hero image before the visitor clicks the card, so the page
 * opens with it already in cache.
 *
 * Renders nothing. Drop it as a direct child of the card (or its wrapping link) — it
 * watches its own `parentElement`.
 *
 * ── The one rule that makes it work ──────────────────────────────────────────────────
 * Next serves every image through `/_next/image?url&w&q`, and that string IS the cache
 * key. So the preload must produce the SAME three values the detail page renders:
 *
 *   url  → the caller passes what `mediaSrc(row)` returned, exactly as the page renders it
 *   q    → DEFAULT_IMAGE_QUALITY, imported from OptimizedImage rather than copied
 *   sizes→ a SIZE_PRESETS key, imported from OptimizedImage rather than copied
 *
 * All three are now READ from the shared image component. They used to be re-declared
 * here, and re-declared values drift silently — tsc cannot see a mismatch between two
 * equal-looking strings:
 *
 *   · 2026-08-07 — the page rendered `q=75` while this file said `quality: 100`.
 *   · 2026-08-14 — the client hero rendered `…/upload/f_auto,q_auto,w_auto/v…/img.webp`
 *     while this file stripped that segment, so every preload fetched a URL the page
 *     never asked for. Both files downloaded, neither reused.
 *
 * Each mismatch costs a SECOND download — the opposite of the point. Never reintroduce a
 * local transform, quality, or sizes literal here: import it.
 */

/** Warm each distinct srcset at most once per session. */
const warmed = new Set<string>();

/**
 * Touch devices have no hover, so the preload must fire on VIEWPORT to help the majority.
 * Cap the automatic viewport preloads per page to protect mobile data — beyond the cap,
 * desktop still preloads on hover. Resets per route.
 */
const VIEWPORT_PRELOAD_CAP = 6;
let viewportPreloads = 0;
let viewportPath = "";

function prefersNoPreload(): boolean {
  const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (!c) return false;
  return Boolean(c.saveData) || /(^|-)2g$/.test(c.effectiveType ?? "");
}

function preloadImage(src: string, sizes: SizePreset) {
  const { props } = getImageProps({
    src,
    alt: "",
    fill: true,
    quality: DEFAULT_IMAGE_QUALITY,
    sizes: SIZE_PRESETS[sizes],
  });
  const key = props.srcSet ?? props.src ?? "";
  if (!key || warmed.has(key)) return;
  warmed.add(key);

  const img = new window.Image();
  img.decoding = "async";
  img.fetchPriority = "low"; // never compete with the current page
  // order matters: sizes → srcset → src
  if (props.sizes) img.sizes = props.sizes;
  if (props.srcSet) img.srcset = props.srcSet;
  if (props.src) img.src = props.src;
}

export interface PreloadHeroImageProps {
  /** Detail page this card links to. */
  href: string;
  /** The resolved src — pass `mediaSrc(row)`, the same value the detail page renders. */
  imageUrl: string | null;
  /** Must match the `sizes` preset the detail hero declares. */
  sizes: SizePreset;
}

export function PreloadHeroImage({ href, imageUrl, sizes }: PreloadHeroImageProps) {
  const router = useRouter();
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersNoPreload()) return;
    const card = anchorRef.current?.parentElement;
    if (!card) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let bound = false;

    // Desktop hover: preload anything the user points at (uncapped, deduped).
    const onEnter = () => {
      router.prefetch(href);
      if (imageUrl) preloadImage(imageUrl, sizes);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            // Per-page cap reset (SPA nav keeps module state alive).
            if (viewportPath !== window.location.pathname) {
              viewportPath = window.location.pathname;
              viewportPreloads = 0;
            }
            if (viewportPreloads < VIEWPORT_PRELOAD_CAP) {
              router.prefetch(href);
              if (imageUrl) preloadImage(imageUrl, sizes);
              viewportPreloads += 1;
            }
            // Still let desktop hover preload cards beyond the cap.
            if (!bound) {
              card.addEventListener("mouseenter", onEnter, { once: true });
              bound = true;
            }
            io.unobserve(entry.target);
          }, 300);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.1 },
    );
    io.observe(card);

    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
      card.removeEventListener("mouseenter", onEnter);
    };
  }, [href, imageUrl, sizes, router]);

  return <span ref={anchorRef} hidden aria-hidden />;
}
