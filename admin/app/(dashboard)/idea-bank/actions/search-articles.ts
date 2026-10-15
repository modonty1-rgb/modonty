"use server";

import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const Input = z.object({ q: z.string().trim().min(2).max(100) });

export type ArticleHit = { id: string; title: string };

/** بحثٌ في عناوين المقالات المنشورة لربط فكرةٍ بمقالها — ٨ نتائج تكفي لاختيارٍ واحد. */
export async function searchArticles(raw: unknown): Promise<ArticleHit[]> {
  const session = await auth();
  if (!(session?.user as { id?: string } | undefined)?.id) return [];
  const parsed = Input.safeParse(raw);
  if (!parsed.success) return [];
  return db.article.findMany({
    where: { status: "PUBLISHED", title: { contains: parsed.data.q, mode: "insensitive" } },
    select: { id: true, title: true },
    orderBy: { datePublished: "desc" },
    take: 8,
  });
}
