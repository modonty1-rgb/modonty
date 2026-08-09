"use server";

import { auth } from "@/lib/auth";

/** What the check actually established, question by question. */
export interface ProbeResult {
  /** Structure passed AND the articles page itself answered 200 without moving. */
  ok: boolean;

  /** 1 · Structure. */
  normalizedUrl?: string;
  structureError?: string;

  /** 2 · The articles page — the address every canonical is built from. */
  status?: number;
  /** Where the request ENDED. Different from `normalizedUrl` = the address moved. */
  finalUrl?: string;
  /** The address redirected somewhere else — a canonical baked on it would redirect. */
  redirected?: boolean;
  articlesError?: string;

  /** 3 · The bare domain. Informational — tells apart "site is down" from "page missing". */
  domainStatus?: number;
  domainError?: string;

  /**
   * The same address with `www` added or removed, when THAT one passes and the typed
   * one does not. Offered as a one-click fix instead of an error the admin has to
   * decipher — `www` is the one rewrite safe to guess, because it is the same page.
   */
  suggestedUrl?: string;
}

/** Hosts that can never be a public canonical base. */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

/** One spelling for comparison: trailing slashes are not a relocation. */
function forCompare(url: string): string {
  return url.replace(/\/+$/, "");
}

/** The same address with `www` flipped on or off — same page, different spelling. */
function wwwCounterpart(url: URL): string {
  const alternate = new URL(url.toString());
  alternate.hostname = alternate.hostname.startsWith("www.")
    ? alternate.hostname.slice(4)
    : `www.${alternate.hostname}`;
  return alternate.toString();
}

/**
 * 1 · STRUCTURE — deterministic, no network. This is the part that genuinely protects
 * the canonical URLs, because every article of this client is baked from the string.
 */
function validateStructure(raw: string): { url: URL } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Enter the articles address" };

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { error: "Enter a full address including https://" };
  }

  // https only: a canonical URL on http is a canonical URL that redirects.
  if (url.protocol !== "https:") return { error: "The address must start with https://" };

  const host = url.hostname.toLowerCase();
  if (LOCAL_HOSTS.has(host)) return { error: "This is a local address — use the client's real domain" };
  if (!host.includes(".")) return { error: "This is not a real domain" };
  // A bare IP cannot carry a certificate the way a canonical base needs to.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return { error: "Use the domain name, not an IP address" };

  if (url.search) return { error: "Remove the query string — canonical URLs are built from this" };
  if (url.hash) return { error: "Remove the # part — canonical URLs are built from this" };

  // One canonical spelling: no trailing slash, so `${base}/${slug}` never doubles up.
  url.pathname = url.pathname.replace(/\/+$/, "");

  return { url };
}

/**
 * GET, not HEAD: a number of hosts and CDNs answer HEAD with 405 and would read as broken.
 *
 * Redirects are followed and then REPORTED, never accepted silently. `response.url` is
 * "the final URL obtained after any redirects" (MDN, Response.url), so comparing it to
 * what we asked for is what catches an address that quietly lands somewhere else.
 */
async function fetchOnce(target: string): Promise<{ status: number; finalUrl: string } | { error: string }> {
  try {
    const response = await fetch(target, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
      headers: { "User-Agent": "Modonty-Admin-DomainCheck/1.0" },
    });
    return { status: response.status, finalUrl: response.url || target };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No answer";
    return { error: message.includes("timeout") ? "The address did not answer in 10 seconds" : message };
  }
}

/**
 * The check, rebuilt after it got a real answer wrong (2026-08-08).
 *
 * The old version asked the DOMAIN and reported its 200 next to a field holding a full
 * articles path. On jbrseo.com that read "answered 200" while `/articles` was in fact a
 * 307 to the homepage — a page that does not exist passed the check. Two rules came out
 * of it, and they are the whole of this file:
 *
 *   · Ask the exact address the canonicals will be built from, not its domain.
 *   · A followed redirect is a FAILURE, not a pass. Google's own ownership check does
 *     the same ("Search Console does not follow redirects when looking for this file").
 *
 * What this still cannot prove is the single-article route — no slug is live yet, so a
 * 404 there is expected. That is settled by the first published article, not here.
 */
export async function probeArticlesBaseUrl(rawUrl: string): Promise<ProbeResult> {
  const session = await auth();
  if (!session) return { ok: false, structureError: "Unauthorized" };

  // 1 · Structure
  const structure = validateStructure(rawUrl);
  if ("error" in structure) return { ok: false, structureError: structure.error };

  const url = structure.url;
  const normalizedUrl = url.toString();

  // 2 · The articles page — and 3 · the bare domain, only so the message can tell the
  // admin whether the whole site is down or just this path is missing.
  const [articlesResult, domainResult] = await Promise.all([
    fetchOnce(normalizedUrl),
    fetchOnce(url.origin),
  ]);

  const domainStatus = "status" in domainResult ? domainResult.status : undefined;
  const domainError = "error" in domainResult ? domainResult.error : undefined;

  if ("error" in articlesResult) {
    return { ok: false, normalizedUrl, articlesError: articlesResult.error, domainStatus, domainError };
  }

  const redirected = forCompare(articlesResult.finalUrl) !== forCompare(normalizedUrl);

  // A redirect is the failure — not the status code.
  //
  // Measured on our own production on 2026-08-08: `www.modonty.com/articles` answers
  // 404 while `www.modonty.com/articles/<slug>` answers 200. An index page at the base
  // is optional; what we bake is `<base>/<slug>`. So demanding 200 here would have
  // rejected the address modonty itself uses. What it may never do is MOVE: if the base
  // redirects, every canonical built on it redirects too, and the base is simply wrong.
  const articlesError = redirected
    ? `This address moves to ${articlesResult.finalUrl} — the address itself is wrong`
    : undefined;

  const ok = !redirected;

  // Only when the typed address failed: try it with `www` flipped. If THAT one is the
  // real page, hand it over as a fix to accept rather than an error to decode. Nothing
  // else is guessed — a redirect to a different path is exactly what got mistaken for a
  // working page once already, so it is never offered as a suggestion.
  const suggestedUrl = ok ? undefined : await findWorkingCounterpart(url);

  return {
    ok,
    normalizedUrl,
    status: articlesResult.status,
    finalUrl: articlesResult.finalUrl,
    redirected,
    articlesError,
    domainStatus,
    domainError,
    suggestedUrl,
  };
}

/** Returns the `www` variant only if it answers at that exact address without moving. */
async function findWorkingCounterpart(url: URL): Promise<string | undefined> {
  const candidate = wwwCounterpart(url);
  const result = await fetchOnce(candidate);
  if ("error" in result) return undefined;
  if (forCompare(result.finalUrl) !== forCompare(candidate)) return undefined;
  return candidate;
}
