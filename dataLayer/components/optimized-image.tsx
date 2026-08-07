import Image from "next/image";
import type { CSSProperties, SyntheticEvent } from "react";

import { mediaSrc, type MediaSrcInput } from "../lib/media-src";

/**
 * The one image component for admin · console · modonty.
 *
 * Moved here from `modonty/components/media/OptimizedImage.tsx` on 2026-08-07 (MI1) under
 * the rule "a component used in more than one place is shared". It is a thin, predictable
 * wrapper over `next/image` — every behaviour below is either a documented Next default or
 * a caller decision. Nothing is decided silently.
 *
 * ── The contract (MI0, approved 2026-08-07) ──────────────────────────────────────────────
 * Each rule is marked [نصّ] when it quotes the installed `next@16.2.9` docs, or [اجتهاد]
 * when it is our own engineering decision. The two are never blurred.
 *
 *  1. [اجتهاد] Zero hidden policy. `preload` changes ONLY preloading — never quality,
 *     never loading, never fetchPriority. The old component silently forced quality 100
 *     and eager+high on every preloaded image, so callers could not reason about output.
 *
 *  2. [نصّ] `quality` defaults to 75, the Next default. The docs warn: "If the original
 *     image is already low quality, setting a high quality value will increase the file
 *     size without improving appearance." Our Bunny files are re-encoded WebP, so the old
 *     automatic 100 inflated bytes on exactly the LCP image it meant to help.
 *
 *  3. [نصّ] `sizes` is REQUIRED — preset name or explicit string. Docs: "sizes should be
 *     used when the image is using fill" and "If sizes is missing, the browser assumes the
 *     image will be as wide as the viewport (100vw). This can cause unnecessarily large
 *     images to be downloaded." A guessed default is worse than a compile error.
 *
 *  4. [نصّ] `preload` stands alone. Docs, "When not to use it": when `loading` is used ·
 *     when `fetchPriority` is used. Callers may still pass either explicitly.
 *
 *  5. [اجتهاد] Blur is automatic from the media row — derived data, not policy. Every row
 *     carries one (591/591 on 2026-08-07) and nothing was reading it.
 *
 *  6. [نصّ] No `loader` prop. The docs' own loader example starts with `'use client'`, so
 *     passing one as a prop turns every consumer into a client component. Bunny's optimizer
 *     belongs in `images.loaderFile` (next.config), which applies to "every instance of
 *     next/image in your application, without passing a prop" — see task BNOPT.
 *
 *  7. [اجتهاد] Takes the media row, not a url string, so src + blur + alt + intrinsic size
 *     resolve in one place instead of four props a caller can silently drop.
 *
 * NOTE: deliberately no `'use client'`. Server callers must stay server components; adding
 * the directive here would pull every consumer — and its tree — into the client bundle.
 */

/** Must mirror `images.qualities` in each app's next.config. */
const QUALITIES = [25, 50, 75, 100] as const;
type QualityValue = (typeof QUALITIES)[number];

/**
 * Named `sizes` values. The strings mirror what the pages already declare today, so
 * migrating a call site is a label swap, not a layout change.
 *
 * Picking a preset answers one question: how wide is this image on screen? Answer it
 * wrong and the browser downloads the wrong file — it cannot cause layout shift, which
 * is `width`/`height`/`fill` territory.
 */
export const SIZE_PRESETS = {
  /** Full-bleed: edge to edge at every width. */
  full: "100vw",
  /** Article hero / LCP: full width on phones, capped by the 1128px container. */
  hero: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px",
  /** Feed and listing cards: 1 column → 2 → 3. */
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  /** Side thumbnails and inline previews. */
  thumb: "128px",
  /** Round avatars, client logos in lists. */
  avatar: "48px",
} as const;

export type SizePreset = keyof typeof SIZE_PRESETS;

/** Media row shape this component needs. `bunnyUrl` + `blurDataURL` are required keys. */
export interface ImageMedia extends MediaSrcInput {
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

interface BaseProps {
  /** The media row. Use `asMedia()` for a bare url (brand constants, remote assets). */
  media: ImageMedia;
  /** Overrides `media.altText`. Pass "" only for decorative images. */
  alt?: string;
  /** REQUIRED — preset name or an explicit `sizes` string. See rule 3. */
  sizes: SizePreset | (string & {});
  className?: string;
  style?: CSSProperties;
  /** Inserts `<link rel="preload">`. Use for the LCP image only. Nothing else changes. */
  preload?: boolean;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  /** Defaults to 75 (Next's default). Must be listed in `images.qualities`. */
  quality?: QualityValue;
  itemProp?: string;
  /** Blur is automatic when the row has one; pass "empty" to opt out. */
  placeholder?: "blur" | "empty";
  unoptimized?: boolean;
  overrideSrc?: string;
  decoding?: "async" | "sync" | "auto";
  onLoad?: (e: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e: SyntheticEvent<HTMLImageElement>) => void;
}

/** Either intrinsic dimensions or `fill` — one of them is what reserves space and prevents CLS. */
export type OptimizedImageProps = BaseProps &
  ({ width: number; height: number; fill?: never } | { fill: true; width?: never; height?: never });

/** Wrap a bare url so it satisfies the media contract (no stored blur, no intrinsic size). */
export function asMedia(url: string, altText?: string | null): ImageMedia {
  return { url, bunnyUrl: null, blurDataURL: null, altText: altText ?? null };
}

export function OptimizedImage({
  media,
  alt,
  sizes,
  className,
  style,
  preload,
  loading,
  fetchPriority,
  quality = 75,
  itemProp,
  placeholder,
  unoptimized,
  overrideSrc,
  decoding,
  onLoad,
  onError,
  ...rest
}: OptimizedImageProps) {
  const src = mediaSrc(media);
  if (!src?.trim()) return null;

  const fill = "fill" in rest ? rest.fill : undefined;
  const width = "width" in rest ? rest.width : undefined;
  const height = "height" in rest ? rest.height : undefined;

  // Rule 5: blur when the row carries one, unless the caller opts out.
  const blur = media.blurDataURL?.trim() || null;
  const resolvedPlaceholder = placeholder ?? (blur ? "blur" : undefined);
  const showBlur = resolvedPlaceholder === "blur" && blur;

  return (
    <Image
      src={src}
      alt={alt ?? media.altText ?? ""}
      {...(fill ? { fill: true as const } : { width: width!, height: height! })}
      className={className}
      style={style}
      sizes={SIZE_PRESETS[sizes as SizePreset] ?? sizes}
      // Rules 1 + 4: each of these is exactly what the caller asked for, nothing derived.
      preload={preload}
      loading={loading}
      fetchPriority={fetchPriority}
      quality={quality}
      placeholder={showBlur ? "blur" : "empty"}
      {...(showBlur ? { blurDataURL: blur } : {})}
      unoptimized={unoptimized}
      overrideSrc={overrideSrc}
      decoding={decoding}
      onLoad={onLoad}
      onError={onError}
      {...(itemProp && { itemProp })}
    />
  );
}
