/**
 * Internal links pasted from Word arrive carrying whatever the editor's link
 * extension puts on them — in practice `rel="noopener noreferrer nofollow"`.
 * On a link that points back at our own site that is self-harm: we are telling
 * Google not to count a page of ours, and the writer never opened the link
 * dialog to see it happen.
 *
 * This module only READS the body and reports. It decides nothing and rewrites
 * nothing — the writer resolves each flagged link himself before the save is
 * allowed through.
 */

/** One pattern for both reading and rewriting, so the anchor numbering can never drift. */
const ANCHOR_RE = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;

/** Anchors that are not navigation between pages, so not our business. */
function isNonNavigational(href: string): boolean {
  return !href || href.startsWith("#") || /^(mailto|tel|javascript|data):/i.test(href);
}

/** `www.` is presentation, not identity — modonty.com and www.modonty.com are one host. */
function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}

function hostOf(url: string): string | null {
  try {
    return normalizeHost(new URL(url).hostname);
  } catch {
    return null;
  }
}

/**
 * A broken address, not an unusual one. Deliberately says nothing about `www` or the
 * extension: `kimazone.net`, `support.google.com` and any client on `.sa` are all
 * legitimate, and a rule demanding `www.…​.com` would reject them. What it rejects is
 * what a paste actually mangles — a doubled protocol, a space inside the address, a
 * host with no dot.
 */
function isMalformed(href: string): boolean {
  if (href.startsWith("/")) return false; // relative — judged elsewhere
  if (/\s/.test(href)) return true;
  if (/^https?:\/\/https?:\/\//i.test(href)) return true;

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return true;
  }

  if (!/^https?:$/.test(url.protocol)) return true;
  // A public address needs a dot and something after it (`https://modonty` does not).
  return !/^[^.\s]+(\.[^.\s]+)+$/.test(url.hostname);
}

/** Reads one attribute off a raw `<a …>` tag. */
function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"));
  return m ? m[1].trim() : null;
}

export type LinkIssue =
  /** Points at our own site but tells Google not to count it — never a choice anyone made. */
  | "internal-nofollow"
  /** `http://` on a site served over https — the browser will warn or block it. */
  | "insecure-http"
  /**
   * On a client's own site, a link back to modonty is a backlink we want. Carrying
   * `nofollow` — which is what a paste puts there — makes Google ignore it, so the
   * backlink is written but worth nothing.
   */
  | "backlink-nofollow"
  /** The page behind it does not answer — measured, not guessed. */
  | "dead-link"
  /** Not a usable address at all: unparseable, doubled protocol, host without a dot. */
  | "malformed-url";

export type LinkRel = "follow" | "nofollow" | "sponsored";
export type LinkTarget = "_blank" | "_self";

export interface AuditedLink {
  /** Position among the anchors of the body — how a decision finds its link again. */
  index: number;
  /** Anchor text as the reader sees it. */
  text: string;
  href: string;
  /** Points at the site this article will live on. */
  isInternal: boolean;
  rel: string | null;
  target: string | null;
  issues: LinkIssue[];
}

export interface LinkDecision {
  index: number;
  rel: LinkRel;
  target: LinkTarget;
  /** Set when the writer corrected the address itself (dead link, or http → https). */
  href?: string;
}

/**
 * `siteUrl` is the domain the article will be published on — modonty.com for our
 * own articles, the client's own domain for a client-site article. Everything on
 * that host (plus root-relative hrefs) counts as internal.
 */
export function auditContentLinks(
  content: string,
  siteUrl: string,
  /** Our own domain, passed only for a client-site article — where a link to it is a backlink. */
  backlinkUrl?: string | null,
): AuditedLink[] {
  if (!content) return [];

  const siteHost = hostOf(siteUrl) ?? normalizeHost(siteUrl.replace(/^https?:\/\//, "").split("/")[0]);
  const backlinkHost = backlinkUrl ? hostOf(backlinkUrl) : null;
  const audited: AuditedLink[] = [];
  let index = -1;

  for (const m of content.matchAll(ANCHOR_RE)) {
    const [, rawAttrs, inner] = m;
    index += 1;
    const href = attr(`<a ${rawAttrs}>`, "href") ?? "";
    if (isNonNavigational(href)) continue;

    const rel = attr(`<a ${rawAttrs}>`, "rel");
    const target = attr(`<a ${rawAttrs}>`, "target");
    const isInternal = href.startsWith("/") || hostOf(href) === siteHost;
    const reviewed = attr(`<a ${rawAttrs}>`, "data-link-reviewed") === "1";

    const carriesNofollow = /\bnofollow\b/i.test(rel ?? "");
    const isBacklinkHome =
      backlinkHost !== null && backlinkHost !== siteHost && hostOf(href) === backlinkHost;

    const issues: LinkIssue[] = [];
    if (isInternal && !reviewed && carriesNofollow) issues.push("internal-nofollow");
    if (isBacklinkHome && !reviewed && carriesNofollow) issues.push("backlink-nofollow");
    if (!reviewed && /^http:\/\//i.test(href)) issues.push("insecure-http");
    if (!reviewed && isMalformed(href)) issues.push("malformed-url");

    audited.push({
      index,
      text: inner.replace(/<[^>]+>/g, "").trim(),
      href,
      isInternal,
      rel,
      target,
      issues,
    });
  }

  return audited;
}

/**
 * Writes the writer's choices back into the body, byte-for-byte in the shape the
 * link dialog already produces (`rich-text-editor.tsx:782-793`) so a reviewed link
 * and a hand-inserted one are indistinguishable in the saved HTML.
 */
export function applyLinkDecisions(content: string, decisions: LinkDecision[]): string {
  if (decisions.length === 0) return content;

  const byIndex = new Map(decisions.map((d) => [d.index, d]));
  let index = -1;

  return content.replace(ANCHOR_RE, (whole, rawAttrs: string, inner: string) => {
    index += 1;
    const decision = byIndex.get(index);
    if (!decision) return whole;

    const rel =
      decision.target === "_blank" ? `${decision.rel} noopener noreferrer` : decision.rel;
    let attrs = rawAttrs
      .replace(/\s*\brel=["'][^"']*["']/gi, "")
      .replace(/\s*\btarget=["'][^"']*["']/gi, "")
      .replace(/\s*\bdata-link-reviewed=["'][^"']*["']/gi, "")
      .trim();

    // The writer corrected the address itself — a dead link or an http one.
    const newHref = decision.href?.trim();
    if (newHref) {
      attrs = attrs.replace(/\bhref=["'][^"']*["']/i, `href="${newHref.replace(/"/g, "&quot;")}"`);
    }

    const rebuilt = [
      attrs,
      `rel="${rel}"`,
      decision.target === "_blank" ? 'target="_blank"' : "",
      // Stamps the link as decided by a human, so the gate stops asking about it.
      'data-link-reviewed="1"',
    ]
      .filter(Boolean)
      .join(" ");

    return `<a ${rebuilt}>${inner}</a>`;
  });
}

/** The links the writer has to resolve before the article can be saved. */
export function findLinksNeedingReview(
  content: string,
  siteUrl: string,
  backlinkUrl?: string | null,
): AuditedLink[] {
  return auditContentLinks(content, siteUrl, backlinkUrl).filter((l) => l.issues.length > 0);
}

/**
 * Folds the measured reachability result into the audit. A link is only marked dead
 * when the check actually answered — if the probe itself failed (network, timeout),
 * the link is left alone. We never block a save on our own failure to measure.
 */
export function withDeadLinks(links: AuditedLink[], deadHrefs: string[]): AuditedLink[] {
  if (deadHrefs.length === 0) return links;
  const dead = new Set(deadHrefs);

  return links.map((link) =>
    dead.has(link.href) && !link.issues.includes("dead-link")
      ? { ...link, issues: [...link.issues, "dead-link" as const] }
      : link,
  );
}

/**
 * Every navigational link worth probing — absolute, well-formed, deduplicated.
 * A malformed address is already flagged; asking the network about it would only
 * add a second complaint about the same link.
 */
export function probeableHrefs(links: AuditedLink[]): string[] {
  return [
    ...new Set(
      links
        .filter((l) => /^https?:\/\//i.test(l.href) && !l.issues.includes("malformed-url"))
        .map((l) => l.href),
    ),
  ];
}
