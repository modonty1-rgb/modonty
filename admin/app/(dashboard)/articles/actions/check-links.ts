"use server";

import { auth } from "@/lib/auth";

/**
 * Asks each link's own server whether the page is there. Runs on our server, not in
 * the writer's browser, because the browser cannot read a cross-origin response and
 * would report every outside link as broken.
 *
 * Only a definite "not there" answer counts. A timeout, a DNS failure or a server
 * that refuses HEAD is OUR failure to measure — the link is left alone rather than
 * accused, so a flaky network can never block a save.
 */

const MAX_LINKS = 40;
const TIMEOUT_MS = 6000;
const CONCURRENCY = 6;

/** Status codes that mean the page is genuinely gone. */
function isDead(status: number): boolean {
  return status === 404 || status === 410;
}

async function probe(url: string): Promise<{ url: string; dead: boolean }> {
  const attempt = async (method: "HEAD" | "GET") => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      return await fetch(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "ModontyLinkCheck/1.0" },
      });
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    const head = await attempt("HEAD");
    if (!isDead(head.status) && head.status < 400) return { url, dead: false };

    // A HEAD answer is not evidence on its own. support.google.com returns 404 to
    // HEAD on pages that serve 200 to a real reader, and other servers answer
    // 403/405/501 to it. Anything that looks bad gets confirmed with a real GET —
    // we accuse a link only when the page itself refuses to load.
    const get = await attempt("GET");
    return { url, dead: isDead(get.status) };
  } catch {
    return { url, dead: false };
  }
}

/** Returns only the addresses that answered "not found". */
export async function checkLinksAction(urls: string[]): Promise<{ dead: string[] }> {
  const session = await auth();
  if (!session?.user) return { dead: [] };

  const targets = urls.filter((u) => /^https?:\/\//i.test(u)).slice(0, MAX_LINKS);
  const dead: string[] = [];

  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const batch = targets.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(probe));
    for (const r of results) if (r.dead) dead.push(r.url);
  }

  return { dead };
}
