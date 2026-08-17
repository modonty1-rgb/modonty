import Link from "next/link";
import { connection } from "next/server";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { AccentHeading } from "@/components/shared/accent-heading/AccentHeading";
import { Skeleton } from "@/components/ui/skeleton";
import { messages } from "@/lib/i18n/messages";
import type { ModontyGalleryImage } from "@/app/modonty/data/get-modonty-gallery";
import type { CSSProperties } from "react";

interface ModontyGalleryProps {
  /** The cached pool; the board draws `PINS.length` of them at random per request. */
  pool: ModontyGalleryImage[];
}

/** The rail is 300px wide (desktop-only; hidden under 1240px), so the board is laid out in px. */
const BOARD = { width: 300, height: 356 } as const;

/**
 * One artwork, not eight thumbnails: every print overlaps a neighbour, turned a few degrees,
 * so the board reads as a single collage (Khalid, 2026-08-17: «دخّلهم في بعض بحيث تكون لوحة
 * فنية واحدة» — after his moodboard reference: «حتى لو تعمل لها rotate، فكرة تشويق مش أكثر»).
 * On hover a print comes to the top, straightens, grows a tenth and takes the brand ring —
 * «pick me up» (Khalid, 2026-08-17: «الماوس لمّا يجي على الصورة يدّيها effect»); reduced
 * motion keeps the lift (z + ring) and skips the movement.
 * A TEASER of the work, not a gallery: crops are on purpose. Every print is the cover of a
 * published article and opens it — a teaser that leads nowhere is a wasted click.
 * `x`/`y`/`w`/`h` in px inside the board; `z` decides who lies on top. Prints bleed past
 * the board's edges and the board clips them, so no background shows through between them
 * (Khalid, 2026-08-17: «المساحات الفاضية مشوّهة المنظر»).
 */
const PINS = [
  { x: -8, y: -6, w: 190, h: 130, rotate: -4, z: 1 },
  { x: 150, y: -2, w: 162, h: 122, rotate: 5, z: 2 },
  { x: -6, y: 98, w: 152, h: 112, rotate: 3, z: 3 },
  { x: 118, y: 90, w: 194, h: 122, rotate: -3, z: 2 },
  { x: 36, y: 178, w: 172, h: 112, rotate: 5, z: 4 },
  { x: 178, y: 174, w: 134, h: 122, rotate: -6, z: 3 },
  { x: -8, y: 262, w: 164, h: 104, rotate: 3, z: 2 },
  { x: 128, y: 258, w: 184, h: 104, rotate: -4, z: 3 },
] as const;

/**
 * Images are deliberately light — 160–200px sizes at quality 50 (Khalid: «صغيرة ووزنها
 * خفيف») — a teaser must not cost what an article cover costs.
 *
 * Per-request draw: `connection()` moves this component to request time (the official
 * pattern for `Math.random()` under Cache Components — `docs/.../08-caching.md`, "Working
 * with non-deterministic operations"), and the caller wraps it in `<Suspense>` with
 * `ModontyGallerySkeleton`. Server-only: the shuffle never re-runs on the client, so the
 * HTML and the hydrated tree always agree.
 */
export async function ModontyGallery({ pool }: ModontyGalleryProps) {
  if (pool.length === 0) return null;
  await connection();
  const images = shuffle(pool).slice(0, PINS.length);

  return (
    <section aria-labelledby="modonty-gallery-heading" className="space-y-2 pt-2">
      <AccentHeading id="modonty-gallery-heading" size="eyebrow">
        {messages.modonty.galleryLabel}
      </AccentHeading>
      <div className="relative overflow-hidden rounded-lg" style={{ width: BOARD.width, height: BOARD.height }}>
        {images.map((image, index) => {
          const pin = PINS[index];
          return (
            <Link
              key={image.id}
              href={image.href}
              aria-label={image.title}
              style={
                {
                  left: pin.x,
                  top: pin.y,
                  width: pin.w,
                  height: pin.h,
                  "--pin-z": pin.z,
                  "--pin-rotate": `${pin.rotate}deg`,
                } as CSSProperties
              }
              className="absolute overflow-hidden rounded-md bg-muted shadow-md ring-2 ring-card transition-[transform,box-shadow] duration-300 ease-out z-[var(--pin-z)] rotate-[var(--pin-rotate)] hover:z-20 hover:shadow-2xl hover:ring-primary focus-visible:z-20 focus-visible:outline-none focus-visible:ring-primary motion-safe:hover:rotate-0 motion-safe:hover:scale-110 motion-safe:focus-visible:rotate-0 motion-safe:focus-visible:scale-110 motion-safe:active:scale-105"
            >
              <OptimizedImage
                media={asMedia(image.url, image.altText, image.blurDataURL)}
                alt=""
                fill
                loading="lazy"
                sizes={pin.w > 160 ? "200px" : "160px"}
                quality={50}
                className="object-cover"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** Same footprint as the board, so the rail does not jump when the draw streams in. */
export function ModontyGallerySkeleton() {
  return (
    <div className="space-y-2 pt-2">
      <Skeleton className="h-3 w-20 rounded" />
      <Skeleton className="rounded-lg" style={{ width: BOARD.width, height: BOARD.height }} />
    </div>
  );
}

/** Fisher–Yates on a copy — the pool itself is a cached value and must not be mutated. */
function shuffle<T>(list: readonly T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
