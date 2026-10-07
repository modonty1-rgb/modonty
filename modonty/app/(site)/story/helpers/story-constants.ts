/**
 * Shared constants for /story page components.
 */
import { BRAND_WORDMARK_URL } from "@modonty/shared/lib/brand-assets";
import { SITE_URL } from "@/constants";

/** The page's own address — its WebPage `url` and the podcast series' `url`/`webFeed`. */
export const STORY_PAGE_URL = `${SITE_URL}/story`;

/**
 * Brand logo — spotlight widgets + page.tsx OG_IMAGE.
 * Was a hardcoded Cloudinary SVG; verified byte-identical (sha 0057be46…, 5728 B) to the
 * shared wordmark already on Bunny, so it reuses that constant instead of a second copy.
 */
export const MODONTY_LOGO_URL = BRAND_WORDMARK_URL;

/** Bunny assets zone, `brand/story/` — partner photos for this page. (Team photos moved to `lib/team/team-members.ts`.) */
const STORY_ASSETS = "https://modonty-asset.b-cdn.net/brand/story";

export const storyPartnerImage = (file: string) => `${STORY_ASSETS}/partners/${file}`;

/**
 * The trust strip's entity facts used to be a constant here. They now arrive as props from
 * the server page, which reads them from Settings — the same row the page's Organization
 * JSON-LD is built from, so the strip and the markup can never state different numbers.
 * Currency label stays: it is how the amount is spelled, not a fact about the company.
 */
export const CAPITAL_CURRENCY_LABEL = "ر.س";
