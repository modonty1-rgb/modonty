async function getModontyBaseUrl(baseUrl?: string | null): Promise<string | null> {
  const u = baseUrl?.trim();
  if (u) return u;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const { getAllSettings } = await import("@/app/(dashboard)/settings/actions/settings-actions");
  const s = await getAllSettings();
  return s.siteUrl?.trim() || null;
}

export async function revalidateModontyTag(
  tag: "articles" | "settings" | "categories" | "clients" | "tags" | "industries" | "faqs",
  baseUrl?: string | null
): Promise<void> {
  try {
    const url = await getModontyBaseUrl(baseUrl);
    if (!url) return;
    const secret = process.env.REVALIDATE_SECRET;

    if (!secret) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[revalidateModontyTag] No REVALIDATE_SECRET - skipping modonty cache invalidation");
      }
      return;
    }

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
