import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const articles = await db.article.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
    select: { id: true, slug: true, clientId: true, datePublished: true },
    take: 100,
  });

  if (articles.length === 0) {
    return NextResponse.json({ published: 0 });
  }

  const ids = articles.map((a) => a.id);

  await db.article.updateMany({
    where: { id: { in: ids } },
    data: {
      status: "PUBLISHED",
      datePublished: now,
      ogArticlePublishedTime: now,
      ogArticleModifiedTime: now,
    },
  });

  // Regenerate SEO for each published article
  try {
    const { generateAndSaveJsonLd } = await import("@/lib/seo/jsonld-storage");
    const { generateAndSaveNextjsMetadata } = await import("@/lib/seo/metadata-storage");
    await Promise.all(
      ids.map(async (id) => {
        await generateAndSaveJsonLd(id);
        await generateAndSaveNextjsMetadata(id);
      })
    );
  } catch {
    // SEO regeneration is best-effort; articles are already published
  }

  await revalidateModontyTag("articles");

  return NextResponse.json({
    published: articles.length,
    ids,
  });
}
