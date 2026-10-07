import type { HomeData } from "@modonty/shared/components/partner-site/free/home";

import { BLOCK_SOURCE } from "@/lib/my-site/block-source";
import { PAGE_BLOCKS } from "@/lib/my-site/page-blocks";
import { BLOCKS_PAGES, type BlocksPage } from "@/lib/my-site/page-keys";

/** قسم لن يظهر على الموقع لأن بياناته ناقصة — واسم الشاشة التي تُدخَل منها. */
export interface MissingBlock {
  key: string;
  name: string;
  /** أين يُدخلها الشريك — تسمية الشاشة كما يراها في القائمة. */
  where: string;
  href: string;
}

/**
 * لكل صفحة: أقسامها التي لن تظهر لأن بياناتها ناقصة.
 *
 * يُحسب على الخادم — `isEmpty` دالّة داخل سجلّ المكوّنات، وتمريرها إلى المتصفّح يعني
 * جرّ كل مكوّنات الموقع إلى حزمة الكونسول. و«احجز» مستثنى: بياناته يضبطها الأدمن
 * (`ctaMode`)، فليس نقصاً على الشريك أن يُطالَب به.
 */
export function buildMissingData(data: HomeData): Record<BlocksPage, MissingBlock[]> {
  const out = {} as Record<BlocksPage, MissingBlock[]>;
  for (const page of BLOCKS_PAGES) {
    out[page] = PAGE_BLOCKS[page]
      // Only what the partner can fill himself. A block the admin or modonty switches on stayed
      // a warning forever, and its empty link just reloaded the page (4 Oct 2026).
      .filter((b) => b.isEmpty(data) && (BLOCK_SOURCE[b.key]?.owner ?? "client") === "client")
      .map((b) => ({
        key: b.key,
        name: b.name,
        where: BLOCK_SOURCE[b.key]?.where ?? "محتوى الموقع",
        href: BLOCK_SOURCE[b.key]?.href ?? "/dashboard/page-content",
      }));
  }
  return out;
}
