import "server-only";

import { db } from "@/lib/db";

/** قائمة فيديوهات المصنع — الأحدث تحديثاً أولاً، مع عنوان المقالة واسم العميل. */
export async function getVideoJobs() {
  return db.videoJob.findMany({
    orderBy: { updatedAt: "desc" },
    take: 300,
    select: {
      id: true,
      status: true,
      revision: true,
      updatedAt: true,
      createdAt: true,
      shorts: { select: { key: true } },
      items: { select: { asset: true, platform: true, status: true } },
      errors: { select: { step: true, message: true, at: true } },
      article: { select: { title: true, slug: true } },
      client: { select: { name: true } },
    },
  });
}

export type VideoJobListRow = Awaited<ReturnType<typeof getVideoJobs>>[number];
