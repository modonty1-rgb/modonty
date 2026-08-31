import { OptimizedImage, asMedia } from "../../../optimized-image";
import { justifyRows, tileAspectRatio, shouldContainTile } from "../../../../lib/justify-rows";
import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/** Packing width for the 1128px container minus 48px padding; widths come back as flex-grow so rows stay justified at any size. */
const PACK_WIDTH = 1080;

/**
 * «أعمالنا — كل الصور» — the repo's gallery standard: JUSTIFIED ROWS. Every row gets a
 * computed height so its images fill the width at their true aspect ratio — zero crop,
 * zero gaps, order preserved (Khalid 2026-08-07, side-by-side on real images).
 */
export function GalleryJustified({ data }: { data: HomeData; preview?: boolean }) {
  const rows = justifyRows(data.gallery, PACK_WIDTH, 240, 12);
  return (
    <Section id="gallery" eyebrow="من شغلنا" heading={`أعمال ${data.name}`}>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-3">
            {row.items.map(({ tile, grow }) => (
              <figure
                key={tile.url}
                /**
                 * الصفّ الأخير لا يُمدَّد على الديسكتوب — يبقى بمقاسه الطبيعي كما يفعل أي
                 * معرض مصفوف. لكنّ ذلك المقاس بكسلاتٌ محسوبة لعرض التعبئة ١٠٨٠، فعلى
                 * ٣٩٠ كان الصفّ يخرج ٧٢٦px خارج الشاشة (مقيس ٣١ أغسطس: `scrollWidth`
                 * ١١٠٤ مقابل ٣٧٨). تحت `md` يتمدّد كبقيّة الصفوف: لا خروج، ولا صورة
                 * مجهرية.
                 */
                className="relative min-w-0 overflow-hidden rounded-lg bg-muted max-md:!w-auto max-md:!flex-1"
                style={row.isLast ? { flex: "0 0 auto", width: `${row.height * grow}px` } : { flexGrow: grow, flexBasis: 0, minWidth: 0 }}
              >
                <div style={{ aspectRatio: tileAspectRatio(tile) }} className="relative">
                  <OptimizedImage media={asMedia(tile.url, tile.alt)} alt={tile.alt} fill sizes="thumb" className={shouldContainTile(tile) ? "object-contain" : "object-cover"} />
                </div>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}
