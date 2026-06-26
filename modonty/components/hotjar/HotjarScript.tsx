import "server-only";
import Script from "next/script";

/**
 * Contentsquare (formerly Hotjar) — Session Replay + Heatmaps tag.
 *
 * Loaded ONLY in production (keeps local-dev sessions out + zero cost in dev), and via
 * next/script `lazyOnload` so it never blocks the initial render — performance is #1 on
 * modonty.com. Tag id comes from `NEXT_PUBLIC_CONTENTSQUARE_TAG_ID` (e.g. c71a2ae23dc5a),
 * which maps to the official tag `https://t.contentsquare.net/uxa/<tagId>.js`.
 */
export function ContentsquareScript() {
  const tagId = process.env.NEXT_PUBLIC_CONTENTSQUARE_TAG_ID;
  if (!tagId || process.env.NODE_ENV !== "production") return null;

  return (
    <Script
      id="contentsquare-uxa"
      src={`https://t.contentsquare.net/uxa/${tagId}.js`}
      strategy="lazyOnload"
    />
  );
}
