import { getIndexingClient, SITE_BASE_URL } from "./client";

// Per Google Indexing API v3 Discovery: enum is URL_NOTIFICATION_TYPE_UNSPECIFIED | URL_UPDATED | URL_DELETED.
// Earlier code used URL_REMOVED which Google rejects silently — fixed below.
export type UrlNotificationType = "URL_UPDATED" | "URL_DELETED";

export interface IndexingResult {
  success: boolean;
  url: string;
  type: UrlNotificationType;
  notifyTime?: string;
  error?: string;
  /** True when we skipped the publish call because Google already has the same notification on file. */
  alreadySent?: boolean;
}

export interface RemovalMetadata {
  url: string;
  /** Set when we have a confirmed URL_DELETED record at Google. */
  removedAt: Date | null;
  /** Set when we have a confirmed URL_UPDATED record at Google. */
  updatedAt: Date | null;
}

/** Resolve a path or full URL into an absolute URL on the configured site. */
export function toAbsoluteUrl(input: string): string {
  try {
    const u = new URL(input);
    return u.toString();
  } catch {
    const base = SITE_BASE_URL.replace(/\/$/, "");
    const path = input.startsWith("/") ? input : `/${input}`;
    return `${base}${path}`;
  }
}

/**
 * Read-only check: returns null if the URL was never notified, otherwise the latest
 * notifyTime values that Google has on file. Uses urlNotifications.getMetadata, which
 * has its own read quota separate from the 200/day publish quota.
 */
export async function getRemovalMetadata(url: string): Promise<RemovalMetadata | null> {
  const absolute = toAbsoluteUrl(url);
  const client = getIndexingClient();
  try {
    const res = await client.urlNotifications.getMetadata({ url: absolute });
    const removeTime = res.data.latestRemove?.notifyTime ?? null;
    const updateTime = res.data.latestUpdate?.notifyTime ?? null;
    if (!removeTime && !updateTime) return null;
    return {
      url: absolute,
      removedAt: removeTime ? new Date(removeTime) : null,
      updatedAt: updateTime ? new Date(updateTime) : null,
    };
  } catch (e) {
    const err = e as { code?: number };
    if (err.code === 404) return null; // never notified — clean slate
    throw e;
  }
}

/** Parallel metadata lookup for many URLs. Failures collapse to null per URL. */
export async function getRemovalMetadataBulk(
  urls: string[],
): Promise<Map<string, RemovalMetadata | null>> {
  const results = await Promise.allSettled(urls.map((u) => getRemovalMetadata(u)));
  const map = new Map<string, RemovalMetadata | null>();
  urls.forEach((url, i) => {
    const r = results[i];
    map.set(url, r.status === "fulfilled" ? r.value : null);
  });
  return map;
}

/**
 * Notify Google that a URL has been updated/created — request crawl & indexing.
 * Note: Google's Indexing API is officially supported for JobPosting + BroadcastEvent,
 * but service-account-owned properties can use it for any URL in practice.
 */
export async function requestIndexing(url: string): Promise<IndexingResult> {
  const absolute = toAbsoluteUrl(url);
  const client = getIndexingClient();
  try {
    const res = await client.urlNotifications.publish({
      requestBody: {
        url: absolute,
        type: "URL_UPDATED",
      },
    });
    return {
      success: true,
      url: absolute,
      type: "URL_UPDATED",
      notifyTime: res.data.urlNotificationMetadata?.latestUpdate?.notifyTime ?? undefined,
    };
  } catch (e) {
    return {
      success: false,
      url: absolute,
      type: "URL_UPDATED",
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

/**
 * Notify Google that a URL has been removed — accelerates de-indexing.
 * Should be paired with the page actually returning 404 or 410 on next crawl.
 *
 * Pre-check via getMetadata: if Google already has a URL_DELETED notification on file
 * for this URL, we skip the publish call to avoid wasting the 200/day write quota.
 */
export async function notifyDeleted(url: string): Promise<IndexingResult> {
  const absolute = toAbsoluteUrl(url);
  const client = getIndexingClient();

  try {
    const meta = await getRemovalMetadata(absolute);
    if (meta?.removedAt) {
      return {
        success: true,
        url: absolute,
        type: "URL_DELETED",
        notifyTime: meta.removedAt.toISOString(),
        alreadySent: true,
      };
    }
  } catch {
    // metadata read failure is non-fatal — fall through to publish attempt
  }

  try {
    const res = await client.urlNotifications.publish({
      requestBody: {
        url: absolute,
        type: "URL_DELETED",
      },
    });
    return {
      success: true,
      url: absolute,
      type: "URL_DELETED",
      notifyTime: res.data.urlNotificationMetadata?.latestRemove?.notifyTime ?? undefined,
    };
  } catch (e) {
    return {
      success: false,
      url: absolute,
      type: "URL_DELETED",
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

/** Bulk version — sequential to respect API quota (200/day default). */
export async function notifyDeletedBatch(urls: string[]): Promise<IndexingResult[]> {
  const results: IndexingResult[] = [];
  for (const url of urls) {
    results.push(await notifyDeleted(url));
  }
  return results;
}

export async function requestIndexingBatch(urls: string[]): Promise<IndexingResult[]> {
  const results: IndexingResult[] = [];
  for (const url of urls) {
    results.push(await requestIndexing(url));
  }
  return results;
}
