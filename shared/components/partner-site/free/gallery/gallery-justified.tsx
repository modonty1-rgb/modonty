import { OptimizedImage, asMedia } from "../../../optimized-image";
import { justifyRows, tileAspectRatio, shouldContainTile, type JustifiedRow } from "../../../../lib/justify-rows";
import { Section } from "../home/parts/section";
import { GalleryZoom } from "./parts/gallery-zoom";
import type { HomeData } from "../home/home-data";

/** Packing width for the 1128px container minus 48px padding; widths come back as flex-grow so rows stay justified at any size. */
const PACK_WIDTH = 1080;
/**
 * Phones get their OWN rows, packed for a ~340px column (4 Oct 2026). The desktop rows were
 * squeezed onto the phone instead: measured on a 390px screen, 3–4 tiles of 103px per row.
 */
const PACK_WIDTH_PHONE = 340;

type Tile = HomeData["gallery"][number];

function Rows({ rows, packWidth, gap, indexOf }: { rows: JustifiedRow<Tile>[]; packWidth: number; gap: string; indexOf: ((t: Tile) => number) | null }) {
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className={`flex ${gap}`}>
          {row.items.map(({ tile, grow }) => (
            <figure
              key={tile.url}
              className="relative min-w-0 overflow-hidden rounded-[var(--ps-radius-card,0.5rem)] bg-muted"
              // The last row keeps its natural size (not stretched), as a share of the packing
              // width — pixels computed for 1080 overflowed every screen narrower than 1128.
              style={row.isLast ? { flex: "0 0 auto", width: `${((row.height * grow) / packWidth) * 100}%` } : { flexGrow: grow, flexBasis: 0, minWidth: 0 }}
            >
              <div style={{ aspectRatio: tileAspectRatio(tile) }} className="relative">
                <OptimizedImage media={asMedia(tile.url, tile.alt)} alt={tile.alt} fill sizes="card" className={shouldContainTile(tile) ? "object-contain" : "object-cover"} />
                {indexOf && (
                  <button
                    type="button"
                    data-gallery-index={indexOf(tile)}
                    aria-label={`تكبير: ${tile.alt}`}
                    className="absolute inset-0 cursor-zoom-in outline-none ring-inset ring-primary focus-visible:ring-2"
                  />
                )}
              </div>
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * «كل الصور» — the repo's gallery standard: JUSTIFIED ROWS. Every row gets a computed height so
 * its images fill the width at their true aspect ratio — zero crop, zero gaps, order preserved
 * (Khalid 2026-08-07, side-by-side on real images).
 */
export function GalleryJustified({ data, preview = false }: { data: HomeData; preview?: boolean }) {
  const rows = justifyRows(data.gallery, PACK_WIDTH, 240, 12);
  const phoneRows = justifyRows(data.gallery, PACK_WIDTH_PHONE, 170, 8);
  // A photo opens full-size on tap (4 Oct 2026: it could not be enlarged at all). The console
  // preview stays inert, like every other link there.
  const indexOf = preview ? null : (t: Tile) => data.gallery.indexOf(t);
  const body = (
    <>
      <div className="md:hidden">
        <Rows rows={phoneRows} packWidth={PACK_WIDTH_PHONE} gap="gap-2" indexOf={indexOf} />
      </div>
      <div className="max-md:hidden">
        <Rows rows={rows} packWidth={PACK_WIDTH} gap="gap-3" indexOf={indexOf} />
      </div>
    </>
  );
  return (
    <Section id="gallery" eyebrow="ألبوم الصور" heading="كل الصور">
      {preview ? body : <GalleryZoom images={data.gallery}>{body}</GalleryZoom>}
    </Section>
  );
}
