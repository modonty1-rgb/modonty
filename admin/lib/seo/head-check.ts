/**
 * Shared URL liveness layer.
 *
 * ── Why this file is deliberately paranoid ──────────────────────────────────────────
 * Khalid (2026-08-04): "التقرير هذا ممكن الموظف يتخصم عليه · ممكن الكاتب يتفصل — تأكد من كل
 * معلومة في التقرير." The output of this module can end up in front of a person whose pay
 * or job is on the line, so a wrong verdict is not a cosmetic bug — it is an accusation.
 *
 * The first version called any non-2xx response "broken". Two consecutive sweeps over the
 * SAME data then reported 16 broken external links and 2 — proof that it was reporting
 * transient noise as fact. Everything below exists to make that impossible:
 *
 *  1. A real browser User-Agent. Plenty of sites reject unidentified automated requests.
 *  2. Retries with backoff. One failure proves nothing; a verdict needs repetition.
 *  3. A verdict vocabulary instead of a boolean. "Blocked to robots" and "slow" are NOT
 *     "dead", and only `dead` may ever be reported as a defect.
 *
 * When in doubt this module returns `inconclusive`. Silence is better than a false charge.
 */

/**
 * - `ok`          — resolved (2xx/3xx).
 * - `dead`        — the server answered clearly that it is gone (404/410) or broken (5xx),
 *                   consistently across retries. Only this is safe to report as a defect.
 * - `blocked`     — the server refused an automated request (401/403/405/429). The page
 *                   may be perfectly fine for a human; never counted against anyone.
 * - `inconclusive`— timeout, DNS failure, reset. Unknown, not proven dead.
 */
export type HeadVerdict = "ok" | "dead" | "blocked" | "inconclusive";

export interface HeadResult {
  url: string;
  verdict: HeadVerdict;
  /** HTTP status, or 0 when the request never completed. */
  status: number;
  /** How many attempts were made before settling on the verdict. */
  attempts: number;
  /** True only for `ok` — kept so existing callers reading `.ok` keep working. */
  ok: boolean;
}

const DEFAULT_CONCURRENCY = 5;
const DEFAULT_TIMEOUT_MS = 12_000; // was 5s — slow but healthy sites were being failed
const DEFAULT_RETRIES = 2; // → up to 3 attempts before any "dead" verdict

/** A real browser UA — many sites 403 an unidentified client and would look "dead". */
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/131.0.0.0 Safari/537.36 ModontyHealthCheck/1.0";

/**
 * Codes that mean "a live server refused a robot", never "the page is gone".
 * 999 is LinkedIn's anti-scraping code — it is not an HTTP standard status at all, and an
 * earlier `status >= 500` catch-all classified it as a dead server. That put a perfectly
 * live profile in the report as a broken citation (caught 2026-08-04). Any code outside
 * the standard ranges is a wall talking, so it must never read as death.
 */
const BLOCKED_STATUSES = new Set([401, 403, 405, 429, 451, 999]);

function classify(status: number): HeadVerdict {
  if (status >= 200 && status < 400) return "ok";
  if (BLOCKED_STATUSES.has(status)) return "blocked";

  // Only the codes Google itself reads as "the content doesn't exist":
  //   "the indexing pipeline removes the URL from the index if it was previously indexed"
  //   — developers.google.com/search/docs/crawling-indexing/http-network-errors
  if (status === 404 || status === 410) return "dead";

  // 5xx is explicitly TEMPORARY in the same document: "5xx codes prompt Google's crawlers
  // to temporarily slow down with crawling". An earlier version classified 5xx as dead,
  // which would have reported a site having a one-hour outage as a removed page.
  // Unproven → never reported.
  return "inconclusive";
}

async function attempt(url: string, timeoutMs: number, method: "HEAD" | "GET"): Promise<number> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "*/*",
      },
    });
    return res.status;
  } finally {
    clearTimeout(timer);
  }
}

async function probeOnce(url: string, timeoutMs: number): Promise<number> {
  try {
    const status = await attempt(url, timeoutMs, "HEAD");
    // Some servers answer HEAD with 403/405 while serving GET perfectly.
    if (BLOCKED_STATUSES.has(status)) {
      try {
        return await attempt(url, timeoutMs, "GET");
      } catch {
        return status;
      }
    }
    return status;
  } catch {
    // HEAD rejected outright — fall back to GET before concluding anything.
    try {
      return await attempt(url, timeoutMs, "GET");
    } catch {
      return 0;
    }
  }
}

/**
 * Probe one URL, repeating until the verdict is trustworthy.
 * `ok` and `blocked` settle immediately — they are already answers from a live server.
 * `dead` and `inconclusive` are retried, because those are the only verdicts that can
 * hurt someone if wrong.
 */
async function probe(url: string, timeoutMs: number, retries: number): Promise<HeadResult> {
  let status = 0;
  let verdict: HeadVerdict = "inconclusive";
  let attempts = 0;

  for (let i = 0; i <= retries; i++) {
    attempts++;
    status = await probeOnce(url, timeoutMs);
    verdict = classify(status);
    if (verdict === "ok" || verdict === "blocked") break;
    if (i < retries) {
      // Linear backoff — enough to ride out a rate limit or a blip, cheap enough at scale.
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }

  return { url, verdict, status, attempts, ok: verdict === "ok" };
}

/** Check every URL, preserving input order. Stateless — no cross-call memory. */
export async function batchHeadCheck(
  urls: string[],
  concurrency = DEFAULT_CONCURRENCY,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<HeadResult[]> {
  const results: HeadResult[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < urls.length) {
      const i = cursor++;
      results[i] = await probe(urls[i], timeoutMs, DEFAULT_RETRIES);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
  return results;
}

export interface HeadChecker {
  /** Resolve every URL, using and filling the run cache. Duplicates cost one request. */
  check(urls: string[]): Promise<Map<string, HeadResult>>;
  /** URLs actually probed so far — the honest number for a progress line. */
  fetched(): number;
}

/**
 * A checker with a cache that lives exactly as long as the caller holds it.
 * Concurrent duplicate URLs share one in-flight promise, so a burst of identical
 * requests inside one batch still hits the network once.
 */
export function createHeadChecker(
  options: { concurrency?: number; timeoutMs?: number; retries?: number } = {}
): HeadChecker {
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const cache = new Map<string, Promise<HeadResult>>();
  let fetched = 0;

  async function check(urls: string[]): Promise<Map<string, HeadResult>> {
    const unique = [...new Set(urls)];
    const misses = unique.filter((u) => !cache.has(u));

    // Register every miss up front so a duplicate later in the same batch awaits the
    // same promise rather than starting a second request.
    let cursor = 0;
    const resolvers = new Map<string, (r: HeadResult) => void>();
    for (const url of misses) {
      cache.set(
        url,
        new Promise<HeadResult>((resolve) => resolvers.set(url, resolve))
      );
    }

    async function worker() {
      while (cursor < misses.length) {
        const url = misses[cursor++];
        fetched++;
        const result = await probe(url, timeoutMs, retries);
        resolvers.get(url)?.(result);
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, misses.length) }, worker));

    const out = new Map<string, HeadResult>();
    await Promise.all(
      unique.map(async (url) => {
        out.set(url, await cache.get(url)!);
      })
    );
    return out;
  }

  return { check, fetched: () => fetched };
}
