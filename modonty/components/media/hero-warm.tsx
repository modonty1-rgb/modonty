"use client";

import { getImageProps } from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { optimizeCloudinaryUrl } from "@/components/media/OptimizedImage";

// Warm-up the ARTICLE DETAIL hero before navigation, so it renders from cache.
// These MUST mirror ArticleFeaturedImage (the detail page hero) exactly, or the
// cache key differs and the warm-up does nothing / double-loads:
//   src = optimizeCloudinaryUrl(url, /*forLcp*/ true)  (bakes w_1200)
//   quality = 100 (OptimizedImage: quality 'auto' + preload → 100)
//   sizes   = the hero's sizes prop
//   fill    = true
const HERO_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px";
const HERO_QUALITY = 100;

// Session-wide dedupe: warm each distinct srcset at most once.
const warmed = new Set<string>();

function prefersNoWarm(): boolean {
  const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (!c) return false;
  return Boolean(c.saveData) || /(^|-)2g$/.test(c.effectiveType ?? "");
}

function warmHero(rawUrl: string) {
  const { props } = getImageProps({
    src: optimizeCloudinaryUrl(rawUrl, true),
    alt: "",
    fill: true,
    quality: HERO_QUALITY,
    sizes: HERO_SIZES,
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

interface ArticleHeroWarmProps {
  href: string;
  /** Raw featured-image URL (same value the detail page renders). */
  imageUrl: string | null;
}

/**
 * Invisible warm-up for any card that links to an ARTICLE detail page. Touches no
 * navigation/link logic: on viewport it prefetches the route; on hover it warms the
 * detail hero image at its exact cache key. If anything fails, the worst case is
 * "no warm-up" — never a broken link.
 *
 * Drop it as a direct child of the element that should act as the hover target
 * (the card container or its wrapping link) — it observes/hovers its parentElement.
 */
export function ArticleHeroWarm({ href, imageUrl }: ArticleHeroWarmProps) {
  const router = useRouter();
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersNoWarm()) return;
    // Hover/observe target = the element that contains this warmer (the card or its
    // wrapping link). Drop <ArticleHeroWarm> as a direct child of that element.
    const card = anchorRef.current?.parentElement;
    if (!card) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let bound = false;

    const onEnter = () => {
      router.prefetch(href);
      if (imageUrl) warmHero(imageUrl);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            router.prefetch(href);
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
  }, [href, imageUrl, router]);

  return <span ref={anchorRef} hidden aria-hidden />;
}
