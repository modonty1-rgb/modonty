// Cross-app cache buster: tells the PUBLIC modonty.com deployment to revalidate a
// cache tag (the console's own revalidatePath only touches the console runtime, so
// regenerated client JSON-LD/meta would otherwise stay stale on the public client
// page). Mirrors admin/lib/revalidate-modonty-tag.ts. Best-effort: never throws.
/**
 * Where to send the bust — NOT simply NEXT_PUBLIC_SITE_URL.
 *
 * That variable points at PRODUCTION even on a dev machine, and it has to: canonical
 * URLs and the "your page on modonty" link must read correctly everywhere. Using it as
 * the revalidation target too meant a save on localhost reached in and dropped caches on
 * the LIVE site — a production action fired from a developer's laptop.
 *
 * Locally we bust the local modonty instead, so a dev save shows up where it was made.
 * Production is unaffected: NODE_ENV is "production" there and the branch never runs.
 * Same guard admin/lib/revalidate-modonty-tag.ts has always had — the console's copy of
 * this file simply never carried it over.
 */
function modontyBaseUrl(): string {
  if (process.env.NODE_ENV === "development") {
    return process.env.MODONTY_LOCAL_URL?.trim() || "http://localhost:3000";
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
}

export async function revalidateModontyTag(
  tag: "articles" | "settings" | "categories" | "clients" | "tags" | "industries" | "faqs"
): Promise<void> {
  try {
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[revalidateModontyTag] No REVALIDATE_SECRET — skipping modonty cache invalidation");
      }
      return;
    }

    const url = modontyBaseUrl();
    const res = await fetch(`${url}/api/revalidate/tag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag, secret }),
    });

    if (!res.ok) {
      console.error(`[revalidateModontyTag] Failed to revalidate tag "${tag}" on ${url} — status ${res.status}`);
    }
  } catch (error) {
    console.error(`[revalidateModontyTag] Network error revalidating tag "${tag}" — modonty may be down:`, error instanceof Error ? error.message : error);
  }
}
