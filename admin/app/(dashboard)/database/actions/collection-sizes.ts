"use server";

import { db } from "@/lib/db";

export interface CollectionSize {
  label: string;
  collection: string;
  sizeMB: number;
  count: number;
}

interface CollStatsResult {
  size?: number;
  count?: number;
  ok: number;
}

const TRACKED_COLLECTIONS = [
  { label: "Articles", collection: "articles" },
  { label: "Media", collection: "media" },
  { label: "Analytics Events", collection: "analytics" },
  { label: "Article Views", collection: "article_views" },
  { label: "Article Versions", collection: "article_versions" },
  { label: "Auth Sessions", collection: "sessions" },
  { label: "Chatbot Messages", collection: "chatbot_messages" },
  { label: "Notifications", collection: "notifications" },
] as const;

async function getCollSize(collection: string): Promise<{ sizeMB: number; count: number }> {
  try {
    const result = (await db.$runCommandRaw({
      collStats: collection,
    })) as unknown as CollStatsResult;
    return {
      sizeMB: Math.round(((result.size ?? 0) / 1024 / 1024) * 100) / 100,
      count: result.count ?? 0,
    };
  } catch {
    return { sizeMB: 0, count: 0 };
  }
}

export async function getCollectionSizes(): Promise<CollectionSize[]> {
  const results = await Promise.all(
    TRACKED_COLLECTIONS.map(async ({ label, collection }) => {
      const { sizeMB, count } = await getCollSize(collection);
      return { label, collection, sizeMB, count };
    })
  );
  return results.sort((a, b) => b.sizeMB - a.sizeMB);
}
