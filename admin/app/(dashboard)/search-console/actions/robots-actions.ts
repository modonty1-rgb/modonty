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

/**
 * Curated list of paths/bots that matter for modonty.com.
 * Each entry says what we EXPECT — the audit verifies reality matches.
 */
const AUDIT_CASES: Array<{
  path: string;
  userAgent: string;
  expect: "allow" | "block";
  group: "public" | "private" | "ai-search" | "ai-training";
  label: string;
}> = [
  // Public pages — must be allowed for Googlebot
  { path: "/", userAgent: "Googlebot", expect: "allow", group: "public", label: "Homepage" },
  { path: "/articles/example", userAgent: "Googlebot", expect: "allow", group: "public", label: "Articles" },
  { path: "/categories/example", userAgent: "Googlebot", expect: "allow", group: "public", label: "Categories" },
  { path: "/tags/example", userAgent: "Googlebot", expect: "allow", group: "public", label: "Tags" },
  { path: "/authors/example", userAgent: "Googlebot", expect: "allow", group: "public", label: "Authors" },
  { path: "/clients/example", userAgent: "Googlebot", expect: "allow", group: "public", label: "Clients" },
  { path: "/sitemap.xml", userAgent: "Googlebot", expect: "allow", group: "public", label: "Main sitemap" },
  { path: "/image-sitemap.xml", userAgent: "Googlebot", expect: "allow", group: "public", label: "Image sitemap" },

  // Private pages — must be BLOCKED for Googlebot
  { path: "/admin/articles", userAgent: "Googlebot", expect: "block", group: "private", label: "Admin area" },
  { path: "/api/trpc/router", userAgent: "Googlebot", expect: "block", group: "private", label: "API routes" },
  { path: "/users/login", userAgent: "Googlebot", expect: "block", group: "private", label: "Login page" },
  { path: "/users/profile", userAgent: "Googlebot", expect: "block", group: "private", label: "User profile" },

  // AI search bots — should be allowed (we want visibility in AI answers)
  { path: "/", userAgent: "OAI-SearchBot", expect: "allow", group: "ai-search", label: "ChatGPT Search" },
  { path: "/", userAgent: "PerplexityBot", expect: "allow", group: "ai-search", label: "Perplexity" },

  // AI training bots — should be BLOCKED (protect content from datasets)
  { path: "/", userAgent: "GPTBot", expect: "block", group: "ai-training", label: "OpenAI training" },
  { path: "/", userAgent: "ClaudeBot", expect: "block", group: "ai-training", label: "Anthropic training" },
  { path: "/", userAgent: "Google-Extended", expect: "block", group: "ai-training", label: "Gemini training" },
  { path: "/", userAgent: "CCBot", expect: "block", group: "ai-training", label: "Common Crawl" },
  { path: "/", userAgent: "Bytespider", expect: "block", group: "ai-training", label: "ByteDance training" },
];

export interface AuditResult {
  path: string;
  userAgent: string;
  label: string;
  group: "public" | "private" | "ai-search" | "ai-training";
  expect: "allow" | "block";
  actual: "allow" | "block";
  pass: boolean;
  matchedRule?: string;
}

interface AuditResponse {
  ok: boolean;
  error?: string;
  results?: AuditResult[];
  passed?: number;
  failed?: number;
  fetchedAt?: string;
}

export async function runRobotsAuditAction(): Promise<AuditResponse> {
  try {
    await requireAuth();
    const robotsRes = await fetchRobotsTxtAction();
    if (!robotsRes.ok || !robotsRes.content) {
      return { ok: false, error: robotsRes.error ?? "Failed to fetch robots.txt" };
    }

    const groups = parseRobotsTxt(robotsRes.content);
    const results: AuditResult[] = [];

    for (const c of AUDIT_CASES) {
      const matchingGroup =
        groups.find((g) => g.userAgents.some((ua) => ua.toLowerCase() === c.userAgent.toLowerCase())) ??
        groups.find((g) => g.userAgents.includes("*"));

      let actual: "allow" | "block" = "allow";
      let matchedRule: string | undefined;

      if (matchingGroup) {
        let bestMatch: { rule: string; type: "allow" | "disallow"; length: number } | null = null;
        for (const rule of matchingGroup.rules) {
          if (matchesRule(c.path, rule.pattern)) {
            const length = rule.pattern.length;
            if (!bestMatch || length > bestMatch.length || (length === bestMatch.length && rule.type === "allow")) {
              bestMatch = { rule: rule.pattern, type: rule.type, length };
            }
          }
        }
        if (bestMatch) {
          actual = bestMatch.type === "allow" ? "allow" : "block";
          matchedRule = `${bestMatch.type}: ${bestMatch.rule}`;
        }
      }

      results.push({
        path: c.path,
        userAgent: c.userAgent,
        label: c.label,
        group: c.group,
        expect: c.expect,
        actual,
        pass: actual === c.expect,
        matchedRule,
      });
    }

    const passed = results.filter((r) => r.pass).length;
    const failed = results.length - passed;

    return {
      ok: true,
      results,
      passed,
      failed,
      fetchedAt: robotsRes.fetchedAt,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Audit failed" };
  }
}
