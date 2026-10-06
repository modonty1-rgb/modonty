import type { HomeBlock } from "@modonty/shared/components/partner-site/free/home";
import { getTheme } from "@modonty/shared/components/partner-site/theme";

import { BLOCKS_PAGES, type BlocksPage } from "./page-keys";

/**
 * Page key → its blocks, in visitor order — read from the partner's THEME, the same registry
 * modonty renders from (shared/components/partner-site/THEMES.md), so preview and site cannot
 * drift. Only «free» exists until the catalog ships.
 */
export const PAGE_BLOCKS: Record<BlocksPage, readonly HomeBlock[]> = Object.fromEntries(
  BLOCKS_PAGES.map((page) => [page, getTheme(null).pages[page]]),
) as Record<BlocksPage, readonly HomeBlock[]>;
