"use server";

import { auth } from "@/lib/auth";
import { SITE_BASE_URL } from "@/lib/gsc/client";

interface RobotsResponse {
  ok: boolean;
  content?: string;
  url?: string;
  status?: number;
  fetchedAt?: string;
  error?: string;
}

interface CheckResponse {
  ok: boolean;
  allowed?: boolean;
  matchedRule?: string;
  matchedUserAgent?: string;
  error?: string;
}

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function fetchRobotsTxtAction(): Promise<RobotsResponse> {
  try {
    await requireAuth();
    const url = `${SITE_BASE_URL}/robots.txt`;
    const res = await fetch(url, { cache: "no-store" });
    const content = await res.text();
    return {
      ok: true,
      url,
      status: res.status,
      content,
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to fetch robots.txt" };
  }
}

/**
 * Check whether a path would be allowed for the given user-agent according to the robots.txt content.
 * Implements the Google robots.txt specification (longest-match wins; explicit allow beats disallow).
 */
export async function checkRobotsPathAction(
  path: string,
  userAgent: string = "Googlebot",
): Promise<CheckResponse> {
  try {
    await requireAuth();
    const robotsRes = await fetchRobotsTxtAction();
    if (!robotsRes.ok || !robotsRes.content) {
      return { ok: false, error: robotsRes.error ?? "No robots.txt content" };
    }

    const groups = parseRobotsTxt(robotsRes.content);
    const matchingGroup =
      groups.find((g) => g.userAgents.some((ua) => ua.toLowerCase() === userAgent.toLowerCase())) ??
      groups.find((g) => g.userAgents.includes("*"));

    if (!matchingGroup) {
      return { ok: true, allowed: true, matchedUserAgent: "(no matching group — default allow)" };
    }

    let testPath = path.trim();
    if (testPath.startsWith("http://") || testPath.startsWith("https://")) {
      try {
        testPath = new URL(testPath).pathname || "/";
      } catch {
        // keep as-is
      }
    }
    if (!testPath.startsWith("/")) testPath = `/${testPath}`;

    let bestMatch: { rule: string; type: "allow" | "disallow"; length: number } | null = null;
    for (const rule of matchingGroup.rules) {
      if (matchesRule(testPath, rule.pattern)) {
        const length = rule.pattern.length;
        if (!bestMatch || length > bestMatch.length || (length === bestMatch.length && rule.type === "allow")) {
          bestMatch = { rule: rule.pattern, type: rule.type, length };
        }
      }
    }

    if (!bestMatch) {
      return { ok: true, allowed: true, matchedUserAgent: matchingGroup.userAgents.join(", ") };
    }
    return {
      ok: true,
      allowed: bestMatch.type === "allow",
      matchedRule: `${bestMatch.type}: ${bestMatch.rule}`,
      matchedUserAgent: matchingGroup.userAgents.join(", "),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Check failed" };
  }
}

interface RobotsGroup {
  userAgents: string[];
  rules: { type: "allow" | "disallow"; pattern: string }[];
}

function parseRobotsTxt(content: string): RobotsGroup[] {
  const lines = content.split("\n").map((l) => l.replace(/#.*$/, "").trim()).filter(Boolean);
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let lastWasUserAgent = false;

  for (const line of lines) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (key === "user-agent") {
      if (!current || !lastWasUserAgent) {
        current = { userAgents: [value], rules: [] };
        groups.push(current);
      } else {
        current.userAgents.push(value);
      }
      lastWasUserAgent = true;
    } else if (key === "allow" || key === "disallow") {
      if (!current) continue;
      if (value) {
        current.rules.push({ type: key, pattern: value });
      }
      lastWasUserAgent = false;
    } else {
      lastWasUserAgent = false;
    }
  }
  return groups;
}

function matchesRule(path: string, pattern: string): boolean {
  // Convert robots.txt pattern to regex (* and $ are special)
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  const regex = new RegExp("^" + escaped);
  return regex.test(path);
}
