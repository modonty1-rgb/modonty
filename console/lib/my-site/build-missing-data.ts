import type { HomeData } from "@modonty/shared/components/partner-site/free/home";

import { BLOCK_SOURCE } from "./block-source";
import { PAGE_BLOCKS } from "./page-blocks";
import { BLOCKS_PAGES, type BlocksPage } from "./page-keys";

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
      .filter((b) => b.key !== "booking" && b.isEmpty(data))
      .map((b) => ({
        key: b.key,
        name: b.name,
        where: BLOCK_SOURCE[b.key]?.where ?? "محتوى الموقع",
        href: BLOCK_SOURCE[b.key]?.href ?? "/dashboard/page-content",
      }));
  }
  return out;
}
