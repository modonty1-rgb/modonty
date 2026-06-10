// Cross-app cache buster: tells the PUBLIC modonty.com deployment to revalidate a
// cache tag (the console's own revalidatePath only touches the console runtime, so
// regenerated client JSON-LD/meta would otherwise stay stale on the public client
// page). Mirrors admin/lib/revalidate-modonty-tag.ts. Best-effort: never throws.
const MODONTY_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";

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

    const res = await fetch(`${MODONTY_BASE_URL}/api/revalidate/tag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag, secret }),
    });

    if (!res.ok) {
      console.error(`[revalidateModontyTag] Failed to revalidate tag "${tag}" on ${MODONTY_BASE_URL} — status ${res.status}`);
    }
  } catch (error) {
    console.error(`[revalidateModontyTag] Network error revalidating tag "${tag}" — modonty may be down:`, error instanceof Error ? error.message : error);
  }
}
