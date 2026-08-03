"use client";

import { getImageProps } from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { optimizeCloudinaryUrl } from "@/components/media/OptimizedImage";
import { stripCloudinaryTransforms } from "@/lib/image-utils";

// Warm-up the DETAIL-page hero before navigation, so it renders from cache.
// Each descriptor MUST mirror the detail hero's <Image> EXACTLY (src transform +
// quality + sizes + fill), or the /_next/image?url&w&q key differs and the warm-up
// does nothing / double-loads.
type WarmKind = "article" | "client";

interface HeroDescriptor {
  /** Same src transform the detail hero applies before next/image. */
  toSrc: (rawUrl: string) => string;
  quality: number;
  sizes: string;
}

const DESCRIPTORS: Record<WarmKind, HeroDescriptor> = {
  // ArticleFeaturedImage: OptimizedImage preload → optimizeCloudinaryUrl(url,true) + quality 100.
  article: {
    toSrc: (u) => optimizeCloudinaryUrl(u, true),
    quality: 100,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px",
  },
  // client-hero-v2: next/image (default quality 75) + stripCloudinaryTransforms.
  client: {
    toSrc: (u) => stripCloudinaryTransforms(u) ?? u,
    quality: 75,
    sizes: "(max-width: 1128px) 100vw, 1096px",
  },
};

// Session-wide dedupe: warm each distinct srcset at most once.
const warmed = new Set<string>();

// Mobile has no hover, so the image warm must fire on VIEWPORT to help the
// majority (touch) users. Cap the automatic viewport warms per page to protect
// mobile data — beyond the cap, desktop still warms on hover. Resets per route.
const VIEWPORT_WARM_CAP = 6;
let vpWarms = 0;
let vpPath = "";

function prefersNoWarm(): boolean {
  const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (!c) return false;
  return Boolean(c.saveData) || /(^|-)2g$/.test(c.effectiveType ?? "");
}

function warmHero(rawUrl: string, kind: WarmKind) {
  const d = DESCRIPTORS[kind];
  const { props } = getImageProps({
    src: d.toSrc(rawUrl),
    alt: "",
    fill: true,
    quality: d.quality,
    sizes: d.sizes,
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

interface HeroWarmProps {
  href: string;
  /** Raw hero/featured-image URL (same value the detail page renders). */
  imageUrl: string | null;
}

/**
 * Invisible warm-up for a card linking to a detail page. Touches no navigation/link
 * logic: warms on VIEWPORT (works on mobile — no hover, capped for data) and, on
 * desktop, additionally on hover for cards beyond the cap. If anything fails, the
 * worst case is "no warm-up" — never a broken link.
 *
 * Drop it as a direct child of the element that should act as the hover/viewport
 * target (the card container or its wrapping link) — it uses its parentElement.
 */
function HeroWarm({ href, imageUrl, kind }: HeroWarmProps & { kind: WarmKind }) {
  const router = useRouter();
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersNoWarm()) return;
    const card = anchorRef.current?.parentElement;
    if (!card) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let bound = false;

    // Desktop hover: warm anything the user points at (uncapped, deduped).
    const onEnter = () => {
      router.prefetch(href);
      if (imageUrl) warmHero(imageUrl, kind);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            // Per-page cap reset (SPA nav keeps module state alive).
            if (vpPath !== window.location.pathname) {
              vpPath = window.location.pathname;
              vpWarms = 0;
            }
            // Viewport warm (works on mobile — no hover needed), capped for data.
            if (vpWarms < VIEWPORT_WARM_CAP) {
              router.prefetch(href);
              if (imageUrl) warmHero(imageUrl, kind);
              vpWarms += 1;
            }
            // Still let desktop hover warm cards beyond the cap.
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
  }, [href, imageUrl, kind, router]);

  return <span ref={anchorRef} hidden aria-hidden />;
}

/** Warm the ARTICLE detail hero from a card linking to /articles/[slug]. */
export function ArticleHeroWarm(props: HeroWarmProps) {
  return <HeroWarm {...props} kind="article" />;
}

/** Warm the CLIENT page hero from a card linking to /clients/[slug]. */
export function ClientHeroWarm(props: HeroWarmProps) {
  return <HeroWarm {...props} kind="client" />;
}
