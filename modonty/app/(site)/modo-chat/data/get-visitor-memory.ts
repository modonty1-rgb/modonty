import "server-only";

import { db } from "@/lib/db";

/** How far back Modo remembers. Older than this and «سألت قبل عن…» reads as surveillance. */
const WINDOW_DAYS = 30;
const MAX_TOPICS = 3;

export interface VisitorMemory {
  /** Scopes this visitor asked in before, newest first — names, not ids. */
  recentScopes: string[];
  /** Their last question, so Modo can pick the thread back up. */
  lastQuestion: string | null;
}

/**
 * What Modo remembers about a returning visitor, across conversations.
 *
 * Until now memory ended at the conversation: every visit started from zero, and someone who
 * asked about dental implants last week was greeted like a stranger. The difference between a
 * tool and someone who knows you is exactly this.
 *
 * Deliberately narrow — scope names and the last question, nothing else. These are health
 * questions: a full interest profile of what a person asked about their body is a liability,
 * not a feature, and it is not needed to say «كنت تسأل في السياحة العلاجية».
 */
export async function getVisitorMemory(userId: string): Promise<VisitorMemory> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const rows = await db.chatbotMessage.findMany({
    where: { userId, createdAt: { gte: since } },
    select: { userQuery: true, industrySlug: true, categorySlug: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  if (rows.length === 0) return { recentScopes: [], lastQuestion: null };

  const slugs = [...new Set(rows.map((r) => r.industrySlug).filter(Boolean))] as string[];
  const industries = slugs.length
    ? await db.industry.findMany({ where: { slug: { in: slugs } }, select: { slug: true, name: true } })
    : [];
  const nameBySlug = new Map(industries.map((i) => [i.slug, i.name]));

  const recentScopes: string[] = [];
  for (const row of rows) {
    const name = row.industrySlug ? nameBySlug.get(row.industrySlug) : null;
    if (name && !recentScopes.includes(name)) recentScopes.push(name);
    if (recentScopes.length >= MAX_TOPICS) break;
  }

  return { recentScopes, lastQuestion: rows[0]?.userQuery ?? null };
}
