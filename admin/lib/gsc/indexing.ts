import { getIndexingClient, SITE_BASE_URL } from "./client";

export type UrlNotificationType = "URL_UPDATED" | "URL_REMOVED";

export interface IndexingResult {
  success: boolean;
  url: string;
  type: UrlNotificationType;
  notifyTime?: string;
  error?: string;
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
 */
export async function notifyDeleted(url: string): Promise<IndexingResult> {
  const absolute = toAbsoluteUrl(url);
  const client = getIndexingClient();
  try {
    const res = await client.urlNotifications.publish({
      requestBody: {
        url: absolute,
        type: "URL_REMOVED",
      },
    });
    return {
      success: true,
      url: absolute,
      type: "URL_REMOVED",
      notifyTime: res.data.urlNotificationMetadata?.latestRemove?.notifyTime ?? undefined,
    };
  } catch (e) {
    return {
      success: false,
      url: absolute,
      type: "URL_REMOVED",
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
