/**
 * IndexNow — open protocol for instant search engine indexing.
 * Single POST reaches: Bing + Yandex + Brave (Yep) + Seznam + Naver.
 * That covers ChatGPT Search, Copilot, DuckDuckGo, Perplexity, Brave AI.
 *
 * Docs: https://www.indexnow.org/documentation
 */

import { SITE_URL } from "@/lib/brand";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const HOST = new URL(SITE_URL).host;

export interface IndexNowResult {
  ok: boolean;
  status: number;
  message: string;
  submittedCount: number;
}

/**
 * Submit URLs to IndexNow. Bing dispatches to all participating engines.
 * Max 10,000 URLs per request (we cap at 1,000 for safety).
 * Returns: { ok, status, message, submittedCount }.
 * Never throws — caller can safely log result without try/catch.
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return {
      ok: false,
      status: 0,
      message: "INDEXNOW_KEY env var not set",
      submittedCount: 0,
    };
  }

  if (urls.length === 0) {
    return { ok: true, status: 200, message: "No URLs to submit", submittedCount: 0 };
  }

  const batch = urls.slice(0, 1000);

  const body = {
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList: batch,
  };

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Host: "api.indexnow.org",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text().catch(() => "");

    let message: string;
    if (res.status === 200) message = "OK — URLs accepted";
    else if (res.status === 202) message = "Accepted — key validation pending";
    else if (res.status === 400) message = `Bad request: ${text || "invalid format"}`;
    else if (res.status === 403) message = `Forbidden — key not found at ${body.keyLocation}`;
    else if (res.status === 422) message = `Unprocessable: URL doesn't belong to host or key mismatch`;
    else if (res.status === 429) message = "Rate limited — potential spam detected";
    else message = `Unexpected status ${res.status}: ${text || "(empty body)"}`;

    return {
      ok: res.status === 200 || res.status === 202,
      status: res.status,
      message,
      submittedCount: batch.length,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: err instanceof Error ? err.message : String(err),
      submittedCount: 0,
    };
  }
}
