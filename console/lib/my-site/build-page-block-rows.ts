import type { HomeData } from "@modonty/shared/components/partner-site/free/home";

import { PAGE_BLOCKS } from "./page-blocks";
import { BLOCKS_PAGES, type BlocksPage } from "./page-keys";

/** One switch in the builder: plain strings and booleans — no component, no function. */
export interface BlockRow {
  key: string;
  name: string;
  /** Hero and the closing call stay on every page. */
  toggleable: boolean;
  /** The client row has nothing for it → the site skips it and the switch is disabled. */
  empty: boolean;
}

/**
 * The block lists flattened for the client: `isEmpty` is EVALUATED here, on the server.
 * Handing the registry itself to a client component would pull every site block into the
 * console's browser bundle to render nine switches.
 */
export function buildPageBlockRows(data: HomeData): Record<BlocksPage, BlockRow[]> {
  const out = {} as Record<BlocksPage, BlockRow[]>;
  for (const page of BLOCKS_PAGES) {
    out[page] = PAGE_BLOCKS[page].map((b) => ({
      key: b.key,
      name: b.name,
      toggleable: b.toggleable,
      empty: b.isEmpty(data),
    }));
  }
  return out;
}
